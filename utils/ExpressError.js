// class ExpressError extends Error {
//     constructor(status, message){
//         super();
//         this.status = status;
//         this.massage = message;
//     }
// }
// module.exports =  ExpressError;

class ExpressError extends Error {
    constructor(status, message){
        super(message);  // Pass message to parent Error constructor
        this.status = status;
        this.name = this.constructor.name;  // Optional: sets error name
    }
}

module.exports = ExpressError;