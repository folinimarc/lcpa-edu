'use strict';

/* RECLASSIFICATION */
class ReclassificationMenuBase {
    constructor(containerId, initialValuesArray, reclassCallback) {
        this.container =  document.getElementById(containerId)
        this.initialValuesArray = initialValuesArray
        this.reclassCallback = reclassCallback
    }

    addEventListeners() {
        this.container.addEventListener('input', this.handleInput.bind(this))
        this.container.addEventListener('focusout', this.handleFocusOut.bind(this))
    }

    sanitizeNumericInput (inputElement, lowerlimit, upperlimit) {
        const v = Number(inputElement.value)
        if (isNaN(v) || v < lowerlimit || v > upperlimit) {
          inputElement.classList.add('blocked')
          return false
        } else {
          inputElement.value = String(Math.round(v, 0))
          inputElement.classList.remove('blocked')
          return true
        }
    }

    toggleButtons () {
        const nErrors = this.container.querySelectorAll('input.blocked').length
        Array.from(this.container.querySelectorAll('.disablable')).forEach(function (el) {
          if (nErrors > 0 && !el.classList.contains('blocked')) {
            el.disabled = true
          } else {
            el.disabled = false
          }
        })
    }

    handleInput (e) {
        // if event happened on a reclassification input
        if (e.target.type === 'text') {
            this.sanitizeNumericInput(e.target, -Infinity, Infinity)
            this.toggleButtons(this.container)
        }
    }

    handleFocusOut (e) {
        // return if any elements are disabled, meaning there is an invalid input
        if (this.container.querySelectorAll('.blocked').length > 0) { return }
        if (e.target.type === 'text') {
            // call provided callback for reclassification
            this.reclassCallback()
        }
    }
}

class EcoReclassificationMenu extends ReclassificationMenuBase {
    constructor(containerId, initialValuesArray, reclassCallback) {
        super(containerId, initialValuesArray, reclassCallback)
        this.template = `<div class='reclass_item d-flex align-children-vertically space-between'>
        <p class=''>%CATEGORYNAME%</p>
        <input type='text' class='reclass_newvalue disablable input-1' value='%VALUE%'>
        </div>`

        this.setupInitalValues()
        this.addEventListeners()
    }

    setupInitalValues() {
        let finishedTemplate = ''
        for (let k = 0; k < this.initialValuesArray.length; k++) {
            finishedTemplate += this.template
            .replace('%CATEGORYNAME%', this.initialValuesArray[k][0])
            .replace('%VALUE%', this.initialValuesArray[k][1])
        }
        this.container.innerHTML = this.container.innerHTML.replace('%CONTENT%', finishedTemplate)
    }
}

class SlopeReclassificationMenu extends ReclassificationMenuBase {
    constructor(containerId, initialValuesArray, reclassCallback) {
        super(containerId, initialValuesArray, reclassCallback)
        this.template = `<div class='%CLASS% reclass_item d-flex align-children-vertically space-between'>
        <input type='text' class='reclass_lowerlimit input-1' disabled value='%LOWERLIMIT%'>
        <p class='m-1'>to</p>
        <input type='text' class='reclass_upperlimit disablable input-1' %DISABLEUPPERLIMIT% value='%UPPERLIMIT%'>
        <p class='m-1'>=</p>
        <input type='text' class='reclass_newvalue disablable input-1' value='%RECLASSVALUE%'>
        </div>`

        this.setupInitalValues()
        this.addEventListeners()
    }

    setupInitalValues() {
        // create replacement values arrays
        const initalValuesLength = this.initialValuesArray.length
        let classValues = []
        let disabledValues = []
        let lowerlimitValues = []
        let upperlimitValues = []
        let reclassValues = []
        for (let k=0; k < initalValuesLength; k++) {
            k > 0 ? lowerlimitValues.push('>' + String(this.initialValuesArray[k - 1][0])) : lowerlimitValues.push('-&infin;')
            upperlimitValues.push(this.initialValuesArray[k][0])
            reclassValues.push(this.initialValuesArray[k][1])
            disabledValues.push('')
            classValues.push('')
        }
        classValues[0] = 'first_item'
        classValues[initalValuesLength-2] = 'reference'
        classValues[initalValuesLength-1] = 'last_item'
        disabledValues[initalValuesLength-1] = 'disabled'
        upperlimitValues[initalValuesLength-1] = '&infin;'

        let finishedTemplate = ''
        for (let k=0; k < initalValuesLength; k++) {
            finishedTemplate += this.template
                .replace('%CLASS%', classValues[k])
                .replace('%DISABLEUPPERLIMIT%', disabledValues[k])
                .replace('%LOWERLIMIT%', lowerlimitValues[k])
                .replace('%UPPERLIMIT%', upperlimitValues[k])
                .replace('%RECLASSVALUE%', reclassValues[k])
        }
        this.container.innerHTML = this.container.innerHTML.replace('%CONTENT%', finishedTemplate)
    }

    addEventListeners () {
        super.addEventListeners()
        // add button
        this.container.querySelector('.add').addEventListener('click', this.addReclassifyCategory.bind(this))
        // remove button
        this.container.querySelector('.remove').addEventListener('click', this.removeReclassifyCategory.bind(this))
    }

    addReclassifyCategory () {
        // get reference item (second last row) and its values, after which the new element will be added.
        const refItem = this.container.querySelector('.reference')
        const refItemUpperlimit = this.container.querySelector('.reference .reclass_upperlimit').value
        const refItemNewvalue = this.container.querySelector(' .reference .reclass_newvalue').value
        // plug values into template: The lowerlimit corresponds to the upperlimit of the reference items.
        // the upperlimit corresponds to the upperlimit of the reference + 1. The value is the same as the reference.
        const newItemUpperlimit = String(Number(refItemUpperlimit) + 1)
        let finishedTemplate = this.template
            .replace('%LOWERLIMIT%', '>' + String(refItemUpperlimit))
            .replace('%UPPERLIMIT%', newItemUpperlimit)
            .replace('%RECLASSVALUE%', refItemNewvalue)
            .replace('%CLASS%', 'reference')
            .replace('%DISABLEUPPERLIMIT%', '')
        refItem.insertAdjacentHTML('afterend', finishedTemplate)
        // update the lowerlimit of the last row, which corresponds to the upperlimit of the new item.
        const lastItemLowerlimit = this.container.querySelector(' .last_item .reclass_lowerlimit')
        lastItemLowerlimit.value = '>' + newItemUpperlimit
        // remove the reference class. The new item will be the new reference, containing the class in the template.
        refItem.classList.remove('reference')
        // enable remove button
        this.container.querySelector(' .remove').classList.remove('blocked')
    }

    removeReclassifyCategory () {
        // if only 3 items remain, disable remove button as after removal only 2 items remain.
        const nrItems = this.container.querySelectorAll('.reclass_item').length
        if (nrItems <= 3) {
            this.container.querySelector('.remove').classList.add('blocked')
        }
        // get reference item (second last item) as well as the previous item
        const refItem = this.container.querySelector('.reference')
        const refItemLowerlimit = this.container.querySelector('.reference .reclass_lowerlimit').value
        const prevItem = refItem.previousElementSibling
        // remove reference item and make previous item new reference
        refItem.parentNode.removeChild(refItem)
        prevItem.classList.add('reference')
        // adjust last item's lowerlimit to be the lower limit of the deleted reference item
        const lastItemLowerlimit = this.container.querySelector('.last_item .reclass_lowerlimit')
        lastItemLowerlimit.value = refItemLowerlimit
    }

    propagateLimits (inputElement) {
        const item = inputElement.parentNode
        const value = Number(inputElement.value)
        // only act on upper_limit inputs (middle column)
        if (inputElement.classList.contains('reclass_upperlimit')) {
          // propagate up
          if (item.classList.contains('last_item')) { return }
          const nextItem = item.nextElementSibling
          let nextItemLowerlimit = nextItem.querySelector('.reclass_lowerlimit')
          const nextItemUpperlimit = nextItem.querySelector('.reclass_upperlimit')
          nextItemLowerlimit.value = '>' + String(value)
          if (!nextItem.classList.contains('last_item') && value >= Number(nextItemUpperlimit.value)) {
            nextItemUpperlimit.value = String(value + 1)
            this.propagateLimits(nextItemUpperlimit)
          }
          // propagate down
          if (item.classList.contains('first_item')) { return }
          const itemLowerlimit =item.querySelector('.reclass_lowerlimit')
          // get rid of '>' and cast to number
          const itemLowerlimitValue = Number(itemLowerlimit.value.slice(1))
          if (value <= itemLowerlimitValue) {
            itemLowerlimit.value = '>' + String(value - 1)
            const previousItem = item.previousElementSibling
            let previousItemUpperlimit = previousItem.querySelector('.reclass_upperlimit')
            previousItemUpperlimit.value = String(value - 1)
            this.propagateLimits(previousItemUpperlimit)
          }
        }
    }

    handleFocusOut (e) {
        // return if any elements are disabled, meaning there is an invalid input
        if (this.container.querySelectorAll('.blocked').length > 0) { return }
        if (e.target.type === 'text') {
            // propagate reclassification bin limits if necessary
            this.propagateLimits(e.target)
            // call parent method
            super.handleFocusOut(e)
        }
    }
}

/* CANVAS */
class CanvasBase {
    constructor(name, canvasId) {
        this.name = name
        this.canvas = document.getElementById(canvasId)
        this.canvasWidth = this.canvas.parentElement.clientWidth
        this.canvasHeight = null
        this.ctx = this.canvas.getContext("2d")
    }
}

class CanvasBg extends CanvasBase {
    constructor(name, canvasId, imgPath) {
        super(name, canvasId)
        this.img = new Image()
        this.img.onload = this.imgOnLoad.bind(this)
        this.img.src = imgPath
        this.initialize()
    }

    initialize() {

    }

    imgOnLoad() {
        this.canvasHeight = this.canvasWidth / this.img.width * this.img.height
        this.setWidthHeight(this.canvasWidth, this.canvasHeight)
        this.ctx.drawImage(this.img, 0, 0, this.canvasWidth, this.canvasHeight)
        console.log(this.name + ': Image loaded! (' + this.canvasWidth + '/' + this.img.width + ') / (' + this.canvasHeight + '/' + this.img.height + ')')
    }

    setWidthHeight(width, height) {
        this.canvas.width = width
        this.canvas.height = height
    }
}