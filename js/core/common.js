define('Common', [], function () {
    return {
        getRandomNumber: function (min, max) {
            let range = max - min;
            let rand = Math.random();
            return (min + Math.round(rand * range));
        },
        getMixed: function (length) {
            let chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
            let res = "";
            for (let i = 0; i < length; i++) {
                let id = Math.ceil(Math.random() * 35);
                res += chars[id];
            }
            return res;
        }
    }
});