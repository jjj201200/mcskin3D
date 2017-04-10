/*
 *	@author zz85 / http://twitter.com/blurspline / http://www.lab4games.net/zz85/blog
 *
 *	Simplification Geometry Modifier
 *    - based on code and technique
 *	  - by Stan Melax in 1998
 *	  - Progressive Mesh type Polygon Reduction Algorithm
 *    - http://www.melax.com/polychop/
 */
define('THREE.SimplifyModifier', ['THREE'], function (THREE) {
    class Vertex {
        constructor(modifier, index, position) {
            this.modifier = modifier;
            this.index = index;
            this.position = position;
            this.edges = {};
        }
        isConnected(vertexIndex) {
            if (this.index == vertexIndex) return true;
            return this.edges[vertexIndex] !== undefined ? true : false;
        }
    };
    class Edge {
        constructor(modifier, a, b) {
            this.modifier = modifier;
            this.a = a;
            this.b = b;
            this.faces = {};
        }
    };
    class Face {
        constructor(modifier, a, b, c, normal, color, edges) {
            this.modifier = modifier;
            this.a = a;
            this.b = b;
            this.c = c;
            this.normal = normal;
            this.color = color;
            this.edges = edges || {};
            this.processEdges(a, b, c);
        }
        processEdges(a, b, c) {
            //a,b
            let [min, max] = [Math.min(a, b), Math.max(a, b)];
            let key = min + '_' + max;
            this.edges[key] = this.modifier.edges[key];

            //b,c
            [min, max] = [Math.min(b, c), Math.max(b, c)];
            key = min + '_' + max;
            this.edges[key] = this.modifier.edges[key];

            //c,a
            [min, max] = [Math.min(c, a), Math.max(c, a)];
            key = min + '_' + max;
            this.edges[key] = this.modifier.edges[key];
        }
    }
    class SimplifyModifier {
        constructor(geometry) {
            if (geometry instanceof THREE.Geometry) {
                this.hasProcessOldVertices = false;
                this.hasProcessOldFaces = false;

                this.oldGeometry = geometry;
                this.oldVertices = geometry.vertices.concat();
                this.oldFaces = geometry.faces.concat();
                this.geometry = geometry.clone();
                this.vertices = {};
                this.faces = {};
                this.edges = {};
            }
            this.processOldVertices();
            this.processOldFaces();
            this.processEdgesFaces();
            this.simplifyVertices();
            // this.clusterVerticesOnCommenFace();

        }
        processOldVertices() {
            for (let vertexIndex in this.oldVertices) {
                let oldVertex = this.oldVertices[vertexIndex];
                this.vertices[vertexIndex] = new Vertex(this, vertexIndex, new THREE.Vector3(oldVertex.x, oldVertex.y, oldVertex.z));
            }
            this.hasProcessOldVertices = true;
        }
        processOldFaces() {
            for (let faceIndex in this.oldFaces) {
                let oldFace = this.oldFaces[faceIndex];
                this.generateEdge(oldFace.a, oldFace.b, faceIndex);
                this.generateEdge(oldFace.b, oldFace.c, faceIndex);
                this.generateEdge(oldFace.c, oldFace.a, faceIndex);
                this.faces[faceIndex] = new Face(this, oldFace.a, oldFace.b, oldFace.c, oldFace.normal, oldFace.color);
            }
            this.hasProcessOldFaces = true;
        }
        processEdgesFaces() {
            for (let edgeIndex in this.edges) {
                let edge = this.edges[edgeIndex];
                for (let faceIndex in edge.faces) {
                    edge.faces[faceIndex] = this.faces[faceIndex];
                }
            }
        }
        generateEdge(a, b, faceIndex) {
            //generate edge key
            let [minIndexVertex, maxIndexVertex] = [Math.min(a, b), Math.max(a, b)];
            let edgeKey = minIndexVertex + '_' + maxIndexVertex;

            //get vertex in new vertices array
            let vertexA = this.vertices[minIndexVertex];
            let vertexB = this.vertices[maxIndexVertex];


            //generate edge
            let edge;
            if (!!this.edges[edgeKey]) { //exist
                edge = this.edges[edgeKey];

            } else {
                edge = new Edge(this, minIndexVertex, maxIndexVertex);
                //dot product
                // let direction = vertexB.position.sub(vertexA.position);
                // edge.direction = direction;
                this.edges[edgeKey] = edge;

            }
            edge.faces[faceIndex] = this.oldFaces[faceIndex];
            vertexA.edges[maxIndexVertex] = edge;
            vertexB.edges[minIndexVertex] = edge;
        }
        simplifyVertices() {
            let vertices = Object.assign({}, this.vertices);
            let t = {};
            for (let vertexIndex in vertices) {
                let vertex = vertices[vertexIndex];
                if (!this.isIntPoisition(vertex.position)) {
                    t[vertex.index] = {};
                    let vertexIndexs = Object.keys(vertex.edges);
                    t[vertexIndex].deletedFaces = {};
                    for (let connectedVertexIndex of vertexIndexs) {
                        let currentVertex = this.vertices[connectedVertexIndex];
                        for (let faceIndex in currentVertex.edges[vertex.index].faces) {
                            t[vertex.index].deletedFaces[faceIndex] = currentVertex.edges[vertex.index].faces[faceIndex];
                            if (t[vertex.index].normal === undefined) t[vertex.index].normal = this.faces[faceIndex].normal;
                            if (t[vertex.index].color === undefined) t[vertex.index].color = this.faces[faceIndex].color;
                            delete this.faces[faceIndex];
                        }
                    }
                }
            }
            let facesKeys = Object.keys(this.faces);
            let facesLength = facesKeys[facesKeys.length - 1];
            for (let vertexIndex in t) {
                t[vertexIndex].faceVertices = {};
                let [next, previous] = [
                    [],
                    []
                ];
                for (let faceIndex in t[vertexIndex].deletedFaces) {
                    let face = t[vertexIndex].deletedFaces[faceIndex];
                    let map = ['a', 'b', 'c'];
                    let [a, b] = [0, 0];
                    for (let i of map)
                        if (face[i] == vertexIndex) map.splice(map.indexOf(i), 1);
                    if (map[0] == 'a' && map[1] == 'c')[a, b] = [face[map[1]], face[map[0]]];
                    else [a, b] = [face[map[0]], face[map[1]]];

                    if (t[vertexIndex].faceVertices[a] == undefined) t[vertexIndex].faceVertices[a] = { it: a };
                    if (t[vertexIndex].faceVertices[b] == undefined) t[vertexIndex].faceVertices[b] = { it: b };

                    t[vertexIndex].faceVertices[a].next = b;
                    let ai = next.indexOf(a);
                    ai >= 0 && next.splice(ai, 1);

                    t[vertexIndex].faceVertices[b].previous = a;
                    let bi = previous.indexOf(b);
                    bi >= 0 && previous.splice(bi, 1);

                    if (t[vertexIndex].faceVertices[a].previous == undefined) {
                        if (previous.indexOf(a) < 0) previous.push(a);
                    } else {
                        let i = previous.indexOf(a);
                        i >= 0 && previous.splice(i, 1);
                    }

                    if (t[vertexIndex].faceVertices[b].next == undefined) {
                        if (next.indexOf(b) < 0) next.push(b);
                    } else {
                        let i = next.indexOf(b);
                        i >= 0 && next.splice(i, 1);
                    }

                    // console.log(a, b, map, next, previous)
                }
                if (next.length == 1 && previous.length == 1) {
                    t[vertexIndex].faceVertices[next[0]].next = previous[0];
                    t[vertexIndex].faceVertices[previous[0]].previous = next[0];
                }
                // console.log(next, previous, t[vertexIndex])
                    //vertives connected
                let sortedVertives = t[vertexIndex].faceVertices;
                let vertexIndexs = Object.keys(sortedVertives);
                let edge, a, b, c;
                let f = [];
                for (let index in vertexIndexs) {
                    if (a != undefined) {
                        if (edge != undefined) {
                            if (edge == a.it + '_' + b.it) {
                                if (b.next == undefined) continue;
                                c = sortedVertives[b.next];
                                let face = new Face(this, a.it, b.it, c.it, t[vertexIndex].normal, t[vertexIndex].color);
                                f.push(face);
                                this.faces[++facesLength] = face;

                                b = sortedVertives[b.next];
                                c = sortedVertives[c.next];
                                edge = a.it + '_' + b.it;
                            }
                        } else if (a.next != undefined) {
                            b = sortedVertives[a.next];
                            edge = a.it + '_' + b.it;
                        }
                    } else {
                        a = sortedVertives[vertexIndexs[0]];
                    }
                }
                // console.log(f);
            }
            // console.log(t);
            // for (let faceIndex in t) {
            //     let face = t[faceIndex]
            // }

            // console.log(this.vertices, this.faces)
        }
        isIntPoisition(position) {
            if (!isNaN(position.x) && parseInt(position.x) != position.x) return false;
            if (!isNaN(position.y) && parseInt(position.y) != position.y) return false;
            if (!isNaN(position.z) && parseInt(position.z) != position.z) return false;
            return true;
        };
        toGeometry() {
                let newGeometry = new THREE.Geometry();
                let vertivesMap = {};
                for (let vertexIndex in this.vertices) {
                    let oldVerx = this.vertices[vertexIndex];
                    let newVertex = new THREE.Vector3(oldVerx.position.x, oldVerx.position.y, oldVerx.position.z);
                    newGeometry.vertices.push(newVertex);
                    vertivesMap[vertexIndex] = newGeometry.vertices.length - 1;
                }
                for (let faceIndex in this.faces) {
                    let oldFace = this.faces[faceIndex];
                    let newFace = new THREE.Face3(vertivesMap[oldFace.a], vertivesMap[oldFace.b], vertivesMap[oldFace.c], oldFace.normal, oldFace.color);
                    // newFace.color.copy(oldFace.color);
                    newGeometry.faces.push(newFace);
                }
                newGeometry.com
                return newGeometry;
            }
            // clusterVerticesOnCommenFace() {
            //     let vertices = Object.assign({}, this.vertices);
            //     let [x, y, z] = [{}, {}, {}];
            //     let i = 0;
            //     for (let index in vertices) {
            //         let tempVertex = vertices[index];
            //         delete vertices[index];
            //         for (let vertexIndex in vertices) {
            //             ++i;
            //             let vertex = vertices[vertexIndex];
            //             if (tempVertex.position.x === vertex.position.x) {
            //                 let xNumber = tempVertex.position.x;
            //                 if (!x[xNumber]) x[xNumber] = {};
            //                 if (x[xNumber][tempVertex.index] == undefined) x[xNumber][tempVertex.index] = tempVertex;
            //                 if (x[xNumber][vertex.index] == undefined) x[xNumber][vertex.index] = vertex;
            //             }
            //             if (tempVertex.position.y === vertex.position.y) {
            //                 let yNumber = tempVertex.position.y;
            //                 if (!y[yNumber]) y[yNumber] = {};
            //                 if (y[yNumber][tempVertex.index] == undefined) y[yNumber][tempVertex.index] = tempVertex;
            //                 if (y[yNumber][vertex.index] == undefined) y[yNumber][vertex.index] = vertex;

        //             }
        //             if (tempVertex.position.z === vertex.position.z) {
        //                 let zNumber = tempVertex.position.z;
        //                 if (!z[zNumber]) z[zNumber] = {};
        //                 if (z[zNumber][tempVertex.index] == undefined) z[zNumber][tempVertex.index] = tempVertex;
        //                 if (z[zNumber][vertex.index] == undefined) z[zNumber][vertex.index] = vertex;
        //             }
        //         }
        //     }
        //     console.log(x, y, z, i);
        // }
    }


    return THREE.SimplifyModifier = SimplifyModifier;
});
