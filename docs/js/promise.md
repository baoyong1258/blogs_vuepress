# Promise

## 常见 Promise 面试题
我们看一些 Promise 的常见面试问法，由浅至深。

1. 了解 Promise 吗？
2. Promise 解决的痛点是什么？
3. Promise 解决的痛点还有其他方法可以解决吗？如果有，请列举。
4. Promise 如何使用？
5. Promise 常用的方法有哪些？它们的作用是什么？
6. Promise 在事件循环中的执行过程是怎样的？
7. Promise 的业界实现都有哪些？
8. 能不能手写一个 Promise 的 polyfill。

## Promise的错误处理机制
- promise中抛出错误 throw new Error('test') 等同于 reject('test')
- Promise 内部的错误不会影响到 Promise 外部的代码
- catch方法返回的还是一个 Promise对象，因此后面还可以接着调用then方法

## Promsie 与事件循环
Promise在初始化时，传入的函数是同步执行的，然后注册 then 回调。注册完之后，继续往下执行同步代码，在这之前，then 中回调不会执行。同步代码块执行完毕后，才会在事件循环中检测是否有可用的 promise 回调，如果有，那么执行，如果没有，继续下一个事件循环。
## Promise 简单实现
- promise内部有pending、fulfilled、rejected这三种状态，并且只能从pending到fulfilled/rejected，状态一旦改变无法更改；
- 内置resolve、reject方法的作用
    - 改变状态
    - 记录value或者reason
    - 触发发布/订阅模式
- 对于then方法的要求
    - 返回一个新的promise用于链式编程
    - 异步执行传入的fufillFn, rejectFn回调函数
    - 如果promise实例对象的状态为pending，则启用发布/订阅模式，将回调函数push
    - fufillFn回调函数的返回值既可以是普通值也可以是一个promise，当为promise时，这个返回值promise的状态决定了promise.then()这个新promise的状态
```
 function isPromise(res) {
      return (typeof res === 'object' && typeof res.then === 'function') ? true : false;
    };
    class myPromise{
        constructor(cb){
            this.state = 'pending';
            this.value = '';
            this.reason = '';
            this.resolveCallback = [];
            this.rejectCallback = [];
            const resolve = (value) => {
              if(this.state === 'pending'){
                  this.value = value;
                  this.state = 'fufilled';
                  this.resolveCallback.forEach(fn => fn());
              }
            };
            const reject = (reason) => {
              if(this.state === 'pending'){
                  this.reason = reason;
                  this.state = 'rejected';
                  this.rejectCallback.forEach(fn => fn());
              }
            };
            cb(resolve, reject);
        }
        then(fufillFn, rejectFn){
            fufillFn = typeof fufillFn === 'function' ? fufillFn : val => val;
            rejectFn = typeof rejectFn === 'function' ? rejectFn : err => { throw err};
            let promise2 = new myPromise((resolve, reject) => {
                // 这里的this代表调用then这个方法的promise实例对象而不是promise2
                // 以下步骤本质上做两件事：调用fufillFn/rejectFn;改变promise2的状态
                if(this.state === 'fufilled'){
                    setTimeout(() => {
                      let x = fufillFn(this.value);
                      // 判断x是否为promise再采取相应措施
                      if(isPromise(x)){
                        x.then(y => resolve(y), err => reject(err));
                      }else {
                        resolve(x);
                      }
                    }, 0);
                }else if(this.state === 'rejected'){
                    setTimeout(() => {
                      let x = rejectFn(this.reason);
                      reject(x);
                    }, 0);
                }else if(this.state === 'pending'){
                    setTimeout(() => {
                      this.resolveCallback.push(() => {
                        let x = fufillFn(this.value);
                        // 判断x是否为promise再采取相应措施
                        if(isPromise(x)){
                          x.then(y => resolve(y), err => reject(err));
                        }else {
                          resolve(x);
                        }
                      });
                      this.rejectCallback.push(() => {
                        let x = rejectFn(this.reason);
                        reject(x);
                      })
                    }, 0);
                }
            });
            return promise2;
        }
    };
    myPromise.resolve = function (val) {
      return new myPromise((resolve, reject) => {
          resolve(value);
      })
    };
    myPromise.reject = function (reason) {
      return new myPromise((resolve, reject) => {
          reject(reason);
      })
    };
    myPromise.race = function (promises) {
      return new myPromise((resolve, reject) => {
          for(let i = 0, len = promises.length; i < len; i++){
              promises[i].then(res => resolve(res), err => reject(err));
          }
      })
    };
    myPromise.all = function (promises) {
      let num = 0, len = promises.length, resArr = [];
      return new myPromise((resolve, reject) => {
        for(let i = 0; i < len; i++){
          promises[i].then(res => {
              resArr[i] = res;
              num ++;
              if(num === len){
                  resolve(resArr);
              }
          }, err => reject(err));
        }
      })
    };
    let p2 = new myPromise((resolve, reject) => {
        setTimeout(() => {resolve('p2...')}, 1000);
    });
    let p3 = new myPromise((resolve, reject) => {
        setTimeout(() => {resolve('p3...')}, 3000);
    });
    let p1 = new myPromise((resolve, reject) => {
      console.log('entry...');
      resolve('my promise');
    });
    console.log('test resolve...');
    p1
      .then(res => {
        console.log(res);
        return new myPromise((resolve, reject) => {
          setTimeout(() => {
            resolve('then2......')
          }, 2000);
        })
      })
      .then(res => {
        console.log(res);
      });
    myPromise.all([p2,p3]).then(res => {
        console.log(res);
    });
```