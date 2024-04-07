const memlab = require('memlab')

const scenario = {
    // initial page load url
    url: () => 'http://127.0.0.1:5500/example.html',

    // action where we want to detect memory leaks
    action: async (page) => {
        await page.click('button#buttonLoadObject')
    },

    // action where we want to go back to the step before
    back: async (page) => {
        await page.click('button#buttonRemoveObject')
    },
}

memlab.run({scenario})