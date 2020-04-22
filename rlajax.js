/*
 * Rate Limited Ajax
 * Author: Joseph Garrigan
 * Licensed under the MIT License
 */

/*
 * Constructor
 */
function rlajax (options) {

  if (options === undefined) {
    options = {};
  }
  if (options.interval === undefined) {
    options.interval = 0;
  }
  if (options.timer === undefined) {
    options.timer = 0;
  }
  if (options.handlers === undefined) {
    options.handlers = 5;
  }
  if (options.logger === undefined) {
    options.logger = false;
  }

  /* provide the stack for the instance */
  this.stack = new stack(0);
  if (options.logger) {
    console.log("created a stack object");
  }

  /* provide a retry interval in ms
   * or use default of 0 events in event queue
   */
  let interval = options.interval;
  if (options.logger) {
    console.log("set the interval too "+options.interval);
  }

  let timer = options.timer;
  let usingTimer = false;
  let timerLimit = options.handlers;

  /* provide an array for the handlers to reside in */
  let handlers = [];
  /* fill the array with handlers */
  for (let i = 0; i < options.handlers; i++) {
    handlers.push(new handler(i));
  }
  if (options.logger) {
    console.log("instantiated "+options.handlers+" handler objects");
  }

  this.countDown = function () {
    if (timer > 1000) {
      timer = timer - 1000;
    } else {
      timer = options.timer;
      timerLimit = options.handlers;
      if (options.logger) {
        console.log("reset timer");
      }
    }
    let clone = this;
    setTimeout(function () {
      clone.countDown();
    }.bind(clone), 1000);
  }

  if (timer > 0) {
    usingTimer = true;
    if (options.logger) {
      console.log("timer is set at "+timer+" ms");
    }
  }

  /* The function for calling the requests */
  this.run = function () {
    if (options.logger) {
      console.log("trying a request");
    }
    /* if the stack has requests */
    if (this.stack.check()) {
      if (options.logger) {
        console.log("stack has requests");
      }
      /* get the first available handler object */
      let i = -1;
      $.each(handlers, function (index, value) {
        if (value.availablility() == true) {
          i = index;
        }
      });
      /* if we received a handler */
      if (i != -1 && ((!usingTimer) || (timerLimit > 0))) {
        if (options.logger) {
          console.log("we got a handler");
        }
        /* send the request */
        handlers[i].process(this.stack.pluck());
        if (options.logger) {
          console.log("we sent the request");
        }
        if (usingTimer) {
          if (timerLimit == options.handlers) {
            this.countDown();
            if (options.logger) {
              console.log("starting the timer");
            }
          }
          timerLimit--;
          if (options.logger) {
            console.log("reducing remaining requests in timer period");
          }
        }
      } else {
        if (options.logger) {
          console.log("couldn't get a handler");
        }
      }
      /* if the stack still has requests */
      if (this.stack.check()) {
        let clone = this;
        setTimeout(function () {
          clone.run()
        }.bind(clone),interval);
        if (options.logger) {
          console.log("we still have requests to process, so making a callback to call the next one");
        }
      } else {
        if (options.logger) {
          console.log("stack empoty. all done");
        }
      }
    }
  }
}

/*
 * The Stack Object
 * this provides a private "queue"
 * for us to store request objects
 */
function stack () {
  /* private queue */
  let queue = [];

  /* check the length of the stack */
  this.check = function () {
    let value = false;
    if (queue.length > 0) {
      value = true;
    }
    return value;
  }

  /* add to the end of the queue */
  this.push = function (r) {
    queue.push(r);
    return this;
  }

  /* add to the front of the queue */
  this.first = function (r) {
    queue.unshift(r);
    return this;
  }

  /* retrieve the next request */
  this.pluck = function () {
    let r = queue[0];
    queue.splice(0,1);
    return r;
  }

  /* clear the queue */
  this.empty = function () {
    queue = [];
    return this;
  }
}

/*
 * The Handler Object
 * We will use this for handling
 * a request
 */
function handler (id) {
  /* a private id which may not be needed */
  let identifier = id;
  /* whether this handler is currently in use */
  let available = true;
  /* the function we are going to use to send the request */
  let handle = $.ajax;

  /* If we need to fetch the handlers id, probably not */
  this.getIdentifier = function () {
    return identifier;
  }

  /* for checking if the handler is available */
  this.availablility = function () {
    return available;
  }

  /* for checking what the function to call requests is */
  this.getHandle = function () {
    return handle;
  }

  /* change the handling function */
  this.setHandle = function (handle) {
    handle = handle;
    return this;
  }

  /* flip the availablility */
  this.toggle = function () {
    available = !available;
  }

  /* send the request */
  this.process = function (r) {
    this.toggle();
    let clone = this;
    $.ajax(r).always(function () {
      clone.toggle();
    }.bind(clone));
  }
}
