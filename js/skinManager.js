define('SkinManager',[
    'ComponentManager',
    'Skin',
    'Common'
],(ComponentManager, Skin, Common)=>{
    return class SkinManager{
        constructor(model){
            if(model instanceof Model){
                this.model = model;
                this.skinObject = {};
            } else throw new Error('target is not a Model');
        }
        addSkin(){
            
        }
        loadComponent(componentData){
            if(componentData.skinid === undefined){
                componentData.skinid = Common.getMixed(16);
            }
            if(this.skinObject[componentData.skinid] === undefined){
                this.skinObject[componentData.skinid] = new Skin(this.model, componentData.skinid);
            }
            this.skinObject[componentData.skinid].addComponent(componentData);
        }
        removeSkin(skinId){
            delete this.skinObject[skinId];
        }
        removeComponent(skinId,componentId){
            this.skinObject[skinId].remove(componentId);
        }
        setSkin(skinId){
            this.skinObject[skinId].set();
        }
        setComponent(skinId,componentId){
            this.skinObject[skinId].set(componentId);
        }
    }
});