(function() {
	`use strict`
	
	if (!Math.floorDecimal) {
		Math.floorDecimal = function(value, exp) {
			let decimal = 1
			for (let i = 0; i < exp; i++) {
				decimal*=10
			}
			return Math.floor(value * decimal) / decimal
		}
	}

	if (!Math.degreeToRadians) {
		Math.degreeToRadians = function(degree) {
			return (degree * Math.PI) / 180
		} 
	}
	
	if (!Math.radiansToDegree) {
		Math.radiansToDegree = function(radians) {
			return (radians * 180) / Math.PI
		}
	}

	if (!Math.convertToUnitCirle) {
		Math.convertToUnitCirle = function(radians) {
			return [ Math.cos(radians), Math.sin(radians) ]
		}
	}

	if (!Math.easeInOutQuad) {
		Math.easeInOutQuad = function(time, initial, final) {
			const curve = time < 0.5 ? 2 * time * time : 1 - Math.pow(-2 * time + 2, 2) / 2
			return ((initial - final) * curve) + final
		}
	}

	if (!Math.matrixIdentity) {
		Math.matrixIdentity = function() {
			return [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			]
		}
	}

	if (!HTMLElement.appendDOM) {
		HTMLElement.prototype.appendDOM = function(stringHtml, position = 'beforeend') {
			this.insertAdjacentHTML(position, stringHtml.trim())
			if (position === 'beforeend') return this.lastElementChild
			else if (position === 'afterbegin') return this.firstElementChild
			else return this
		}
	}
})()
