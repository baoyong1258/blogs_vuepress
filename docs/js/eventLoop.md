# 事件循环机制

::: tip
This is a tip
:::
## JS单线程、异步、同步概念
- 众所周知，JS是单线程（如果一个线程删DOM，一个线程增DOM，浏览器傻逼了～所以只能单着了），虽然有webworker酱紫的多线程出现，但也是在主线程的控制下。webworker仅仅能进行计算任务，不能操作DOM，所以本质上还是单线程。
- 单线程即任务是串行的，后一个任务需要等待前一个任务的执行，这就可能出现长时间的等待。但由于类似ajax网络请求、setTimeout时间延迟、DOM事件的用户交互等，这些任务并不消耗 CPU，是一种空等，资源浪费，因此出现了异步。通过将任务交给相应的异步模块去处理，主线程的效率大大提升，可以并行的去处理其他的操作。当异步处理完成，主线程空闲时，主线程读取相应的callback，进行后续的操作，最大程度的利用CPU。此时出现了同步执行和异步执行的概念，同步执行是主线程按照顺序，串行执行任务；异步执行就是cpu跳过等待，先处理后续的任务（CPU与网络模块、timer等并行进行任务）。由此产生了任务队列与事件循环，来协调主线程与异步模块之间的工作。
## 事件循环机制
![事件循环示例图](../.vuepress/public/images/js_event_loop.png)
- 如上图为事件循环示例图（或JS运行机制图），流程如下：
    - step1：主线程读取JS代码，此时为同步环境，形成相应的堆和执行栈；
    - step2:  主线程遇到异步任务，指给对应的异步进程进行处理（WEB API）;
    - step3:  异步进程处理完毕（Ajax返回、DOM事件处罚、Timer到等），将相应的异步任务推入任务队列；
    - step4: 主线程执行完毕，查询任务队列，如果存在任务，则取出一个任务推入主线程处理（先进先出）；
    - step5: 重复执行step2、3、4；称为事件循环。
- 执行的大意：
    - 同步环境执行(step1) -> 事件循环1(step4) -> 事件循环2(step4的重复)…
- 其中的异步进程有：
    - a、类似onclick等，由浏览器内核的DOM binding模块处理，事件触发时，回调函数添加到任务队列中；
    - b、setTimeout等，由浏览器内核的Timer模块处理，时间到达时，回调函数添加到任务队列中；
    - c、Ajax，由浏览器内核的Network模块处理，网络请求返回后，添加到任务队列中。
## 任务队列
**如上示意图，任务队列存在多个，同一任务队列内，按队列顺序被主线程取走；不同任务队列之间，存在着优先级，优先级高的优先获取（如用户I/O）**
- 任务队列的类型
    - 任务队列存在两种类型，一种为microtask queue，另一种为macrotask queue。
    - 图中所列出的任务队列均为macrotask queue，而ES6 的 promise［ECMAScript标准］产生的任务队列为microtask queue。
- 两者的区别
    - microtask queue：唯一，整个事件循环当中，仅存在一个；执行为同步，同一个事件循环中的microtask会按队列顺序，串行执行完毕；
    - macrotask queue：不唯一，存在一定的优先级（用户I/O部分优先级更高）；异步执行，同一事件循环中，只执行一个。
- 更完整的事件循环流程
    - 将microtask加入到JS运行机制流程中，则：
        - step1、2、3同上，
        - step4：主线程查询任务队列，执行microtask queue，将其按序执行，全部执行完毕；
        - step5：主线程查询任务队列，执行macrotask queue，取队首任务执行，执行完毕；
        - step6：重复step4、step5。
    - microtask queue中的所有callback处在同一个事件循环中，而macrotask queue中的callback有自己的事件循环。
    - 简而言之：同步环境执行 -> 事件循环1（microtask queue的All）-> 事件循环2(macrotask queue中的一个) -> 事件循环1（microtask queue的All）-> 事件循环2(macrotask queue中的一个)...
    - 利用microtask queue可以形成一个同步执行的环境，但如果Microtask queue太长，将导致Macrotask任务长时间执行不了，最终导致用户I/O无响应等，所以使用需慎重。
## 总结
- 核心概念：主线程、异步进程、异步队列
- 执行主线程，遇到异步任务交由异步进程处理，主线程继续执行
- 异步进程执行完毕，异步任务并不会立即执行，而是会被推入到异步队列中，异步队列分为microtask和macrotask
    - microtask：包含了process.nextTick、Promise、Object.observe、MutationObserver等
    - macrotask：包含了setTimeout、setInterval、setImmediate、requestAnimationFrame、I/O、UIrendering
    - microtask优先级高于macrotask
- 当主线程清空是，会将异步队列中的第一个异步任务推入到主线程中执行，然后重复上述操作

## 例题
```
console.log('1, time = ' + new Date().toString())
setTimeout(macroCallback, 0);
new Promise(function(resolve, reject) {
    console.log('2, time = ' + new Date().toString())
    resolve();
    console.log('3, time = ' + new Date().toString())
}).then(microCallback);

function macroCallback() {
    console.log('4, time = ' + new Date().toString())
} 

function microCallback() {
    console.log('5, time = ' + new Date().toString())
} 
// 1 2 3 5 4