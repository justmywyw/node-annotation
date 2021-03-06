/**
 * Description
 * @Author:      wyw   <wyw.wang@qunar.com>
 * @Date:    2016-06-08 10:23:06
 */

/*@AutoLoad*/
var _ = require('lodash'),
    Path = require('path'),
    PROXYCYCLE = require('../../PROXYCYCLE'),
    INTERCEPTOR = require('../../INTERCEPTOR'),
    ApplicationContext = require("../../ApplicationContext");

var ControllerAdvice = module.exports = require("../Annotation").extend({
    execute: function() {
        this.traverse(function(i, item){
            var name = item.model.name();
            switch(name){
                case 'ExceptionHandler':
                    ControllerAdvice.exceptionHandlers.push(item.data);
                    break;
                default:
                    // do nothing
                    break;
            }
        }, this);
    }
}, {
    //annotation name
    name: "ControllerAdvice",
    exceptionHandlers: []
});

ApplicationContext.getBean(Path.join(__dirname, '../controller/Controller'))
.then(function(Controller){
    Controller.addMethodInterceptor('handlerException',
     PROXYCYCLE.AFTER,
     INTERCEPTOR.PROTOTYPE,
     function(breakNext, err, req, res){
        if(!breakNext){
            _.forEach(ControllerAdvice.exceptionHandlers, function(el){
                if(el.match(err)){
                    el.fun(err, req, res);
                    return false;
                }
            });
        }
    });
})
