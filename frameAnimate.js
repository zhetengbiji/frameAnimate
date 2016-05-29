(function() {
	'use strict';

	function FrameAnimate(canvas, opts, callback) {

		this.canvas = canvas;

		this.width = opts.width;
		this.height = opts.height;
		this.frame = opts.frame;
		this.fps = opts.fps || 24;
		this.loop = opts.loop;
		this.loopCount = opts.loopCount;
		this.singleMode = opts.singleMode || false;
		this.extension = opts.extension || 'png'; //文件扩展名
		this.reverse = opts.reverse || false; //倒叙播放

		this.callback = callback;

		this._currentFrame = 0;
		this.source = this.canvas.getAttribute('data-source');
		this._setInterval;
		this._onloadLength = 0;

		this._frames = [];

		this.init();

	}

	FrameAnimate.prototype.init = function() {
		var self = this;
		console.log(self)
		this.canvas.width = this.width;
		this.canvas.height = this.height;

		this._ctx = this.canvas.getContext("2d");

		if (this.singleMode) {
			singleMode();
		} else {
			picsMode();
		}
		// 未完成
		function singleMode() {
			self._img = new Image();
			self._img.src = self.source;
			self._img.onload = function() {
				var img_WIDTH = self._img.width / self.width;
				var img_HEIGHT = self._img.height / self.height;
				for (var i = 0; i < img_HEIGHT; i++) {
					for (var j = 0; j < img_WIDTH; j++) {
						var frame = {
							x: (j % img_WIDTH) * self.width,
							y: i * self.height
						};
						self.frames.push(frame);
					}
				}
			};
		}

		function picsMode() {
			function source(i) {
				var _img = new Image();
				_img.src = self.source + i + '.' + self.extension;
				self._frames.push(_img);

				_img.onload = function() {
					self._onloadLength++;
				}
			}
			if (self.reverse) {
				for (var i = self.frame; i > 0; i--) {
					source(i - 1);
				}
			} else {
				for (var i = 0; i < self.frame; i++) {
					source(i);
				}
			}

		}
	};

	FrameAnimate.prototype.draw = function(fn) {
		var self = this;
		self._ctx.clearRect(0, 0, self.width, self.height);
		var f = self._frames[self._currentFrame];
		if (self.singleMode) {
			self._ctx.drawImage(self._img, f.x, f.y, self.width, self.height);
		} else {
			self._ctx.drawImage(f, 0, 0, self.width, self.height);
		}

		if (self._currentFrame === self.frame - 1) {

			self._currentFrame = 0;
			if (!self.loop) {
				// clearInterval(self._setInterval);
				self.pause();
				if (typeof fn === 'function') {
					fn();
				}
			}
			if (self.loopCount) {
				if (self.loopCount > 1) {
					self.loopCount--;
				} else {
					// clearInterval(self._setInterval);
					self.pause();
				}
			}
		} else {
			self._currentFrame++;
		}
	};

	FrameAnimate.prototype.checkLoad = function(next, n, fn) {
		var self = this;
		self._setInterval = setInterval(function() {
			if (self._onloadLength === self.frame) {
				// console.log("==pics load complete==");
				clearInterval(self._setInterval);

				switch (next) {
					case 'draw':
						self.draw();
						break;
					case 'seekTo':
						self.seekTo(n, fn);
						break;
					default:
						self.play(typeof n === 'function' ? n : null);
				}
			}
		}, 1000 / this.fps);
	};

	FrameAnimate.prototype.play = function(fn) {
		var self = this;
		self.pause();
		if (self._onloadLength < self.frame) {
			self.checkLoad('play', fn);
		} else {
			self._setInterval = setInterval(function() {
				if (self._onloadLength === self.frame) {
					self.draw(fn);
				}
			}, 1000 / this.fps);
		}
	};

	FrameAnimate.prototype.pause = function() {
		var self = this;
		if (self._setInterval) {
			clearInterval(self._setInterval);
		}
		if (self.callback) {
			self.callback();
		}
	};

	FrameAnimate.prototype.stop = function() {
		var self = this;
		self.pause();
		self.seekTo(self.frame - 1);
	};

	FrameAnimate.prototype.replay = function() {
		this.pause();
		this.seekTo(0);
		this.play();
	};

	FrameAnimate.prototype.seekTo = function(n, fn) {
		var self = this;

		self.pause();
		self._currentFrame = n;
		if (self._onloadLength < self.frame) {
			self.checkLoad('seekTo', n, fn);
		} else {
			self.draw(fn);
		}
	};
	if (typeof define === 'function' && (define.amd || define.cmd)) {
		define(function() {
			return FrameAnimate;
		});
	} else {
		window.FrameAnimate = FrameAnimate;
	}
}());