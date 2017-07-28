define('item.Skin',[
    'Item',
    'item.Component'
],function(Item, Component){
    return class Skin extends Item {
        constructor(model, skinId){
            if(model instanceof Model){
                this.model = model;
                this.id = skinId;
                this.componentObject = {};

                for(let index in this.model.data.data){
                    this.componentObject[index]={};
                }
            } else throw new Error('target is not a Model');
        }
        addComponent(componentData){
            if(componentData.id === undefined){
                throw new Error('error component has no id');
            }
            if(this.componentObject[ComponentData.type] !== undefined){
                this.componentObject[ComponentData.type] = new Component(ComponentData);
            } else throw new Error('error component has no type');
        }
        remove(type){
            if(type === undefined){
                throw new Error('error component has no type');
            }else{
                delete this.componentObject[type];
            }
        }
        set(componentId){
            if(componentId === undefined){
                
            }else{

            }
        }
    }
});