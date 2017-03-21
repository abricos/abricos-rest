'use strict';

var Response = function(request, err, response, module, structure){
    var body = response.body ? response.body : {};

    for (var n in body){
        if (body.hasOwnProperty(n)){
            this[n] = body[n];
        }
    }

    this._getPrivate = function(){
        return {
            request: request,
            err: err,
            response: response,
            module: module,
            structure: structure
        };

    };
};

Response.prototype.getCodes = function(){
    var p = this._getPrivate();
    return p.response.headers['x-extended-code'] | 0;
};

Response.prototype.getError = function(){
    var p = this._getPrivate();
    var req = p.request;
    var res = p.response;
    if (!p.err && res.statusCode === 200){
        return null;
    }
    var err = {
        request: {
            method: req.method,
            uri: req.uri
        },
        statusCode: res.statusCode,
        codes: this.getCodes()
    };
    if (p.request.body){
        err.request.body = p.request.body
    }
    if (p.codes == 0 || !p.module
        || !p.structure || p.structure.codes === 0){
        return err;
    }
    err.msgCodes = [];

    var codeList = p.structure.codes;
    for (var i = 0, item; i < codeList.length; i++){
        item = codeList[i];
        if (item.code & err.codes){
            err.msgCodes[err.msgCodes.length] = item.id;
        }
    }
    return err;
};

Response.prototype.isError = function(){
    return !!this.getError();
};

module.exports = Response;