# rlajax
Rate Limited Ajax Handler

I made this library because I was maintaining a very old case management platform that had sprawled in an uncorrdinated fashion. The async calls to the backend had scaled out overtime to the point where a units of functionality would break other units of functionality or cause random page loads and server timeouts. 

## Usage

### Instantiate

    Instantiate an rlajax object. Pass an options object as described below: 
    * interaval - the cooldown time for a handler before it handles the next request in the stack. 
    * handlers - the number of handlers pulling from the stack of requests.
    * timer - the regulator for the number of active requests allowed in a given period of time.
    * logger - flag to print statements to the console

    ```javascript
    let obj = new rlajax({
        interaval: 2000,
        handlers: 3,
        timer: 60000,
        logger: true
    });
    ```

### Adding a request

    ```javascript
    obj.stack.push({
        url: "https://example.com",
        type: "GET",
        success: function (response) {
            console.log(response)
        }
    });
    ```

### Sending requests

    ````javascript
    obj.run();
    ```

## Components

### rlajax

    The encapsulating object that reads from the stack and calls the handlers.

### stack

    The stack provides a queue for holding request objects to be passed to a handler. 

### handler

    The handler processes the next request from the stack.
