module.exports = {
    title: 'by的技术博客',
    description: 'just play around',
    themeConfig: {
        nav: [
          { text: 'JavaScript', link: '/js/eventLoop.html' },
          { text: 'Vue', link: '/vue/' },
          { text: 'Node', link: '/node/' },
        ],
        sidebar: {
            '/vue/': [
              '',     /* /foo/ */
              'one',  /* /foo/one.html */
              'two'   /* /foo/two.html */
            ],
      
            '/node/': [
              '',      /* /bar/ */
              'three', /* /bar/three.html */
              'four'   
            ],
      
            // fallback
            '/js/': [
              'eventLoop',    
              'promise', 
            ]
        },
        search: false,
        serviceWorker: {
            updatePopup: true // Boolean | Object, 默认值是 undefined.
        },
    }
}