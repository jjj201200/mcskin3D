define('Item',['Common'],function(Common){
    return class Item {
        constructor(options){
            if(options === undefined || options.id === undefined) {
                this.id = Common.getMixed(16);
            } else {
                this.id = options.id;
            }
        }
    }
});