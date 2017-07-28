define('Queue', ['THREE', 'TWEEN', 'Model'], function (THREE, TWEEN, Model) {
    return class Queue{
        constructor(model){
            let _this = this;
            this.skinObject = {};
            this.lists = {};
            this.model = model;
            this.dependItems = []   //name list

            for(let item in this.model.dependItems){
                this.dependItems.push('item.' + this.model.dependItems[item]);
            }
            require(this.dependItems,function(...args){
                _this.dependItems = args
            })
            
            if(model instanceof Model){
                for(let component in model.data){
                    this.lists[component.name]={
                        list:[],
                        point:0
                    };
                }
            } else throw new Error('target is not a Array');

            
        }
        add(component){
            if(component instanceof Array){
                for(let index in component){
                    
                }
            } else {
                for(let index in this.dependItems){
                    if(component instanceof this.dependItems[index]){

                    }
                }
            }
        }
    }
});