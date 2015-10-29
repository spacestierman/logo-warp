var FpsHistory = function(maximumNumberToTrack) {
	this._maximumNumberToTrack = maximumNumberToTrack;
	this._values = [];
	this._durations = [];
}

FpsHistory.prototype = {
	log: function(durationInMilliseconds, frameRate) {
		this._values.push(frameRate);
		if (this._values.length > this._maximumNumberToTrack) {
			this._values.splice(0, 1);
		}
		
		this._durations.push(durationInMilliseconds);
		if (this._durations.length > this._maximumNumberToTrack) {
			this._durations.splice(0, 1);
		}
	},
	
	getLastFps: function() {
		return this._getLast(this._values);
	},
	
	getLastDuration: function() {
		return this._getLast(this._durations);
	},
	
	_getLast: function(array) {
		if (array.length <= 0) {
			return 0.0;
		}
		
		return array[array.length - 1];	
	},
	
	getAverageFps: function() {
		return this._getAverage(this._values);
	},
	
	getAverageDuration: function() {
		return this._getAverage(this._durations);
	},
	
	_getAverage: function(array) {
		if (array.length <= 0) {
			return 0.0;
		}
		
		var sum = 0.0;
		for(var i=0; i<array.length; i++) {
			sum += array[i];
		}
		
		return sum / array.length;
	},
	
	getAverageFpsForLastFrames: function(numberOfFrames) {
		return this._getAverageForLastFrames(this._values, numberOfFrames);
	},
	
	getAverageDurationForLastFrames: function(numberOfFrames) {
		return this._getAverageForLastFrames(this._durations, numberOfFrames);
	},
	
	_getAverageForLastFrames: function(array, numberOfFrames)
	{
		if (numberOfFrames <= 0) {
			throw "numberOfFrames must be a positive integer";
		}
		if (array.length < numberOfFrames) {
			throw "Not enough frames";
		}
		
		var sum = 0.0;
		for(var i=array.length - numberOfFrames; i<array.length; i++) {
			sum += array[i];
		}
		
		return sum / numberOfFrames;
	},
	
	getHighestFramerateForLastFrames: function(numberOfFrames) {
		return this._getHighest(this._values, numberOfFrames);
	},
	
	getHighestDurationForLastFrames: function(numberOfFrames) {
		return this._getHighest(this._duration, numberOfFrames);
	},
	
	_getHighest: function(array, numberOfFrames) {
		if (array.length <= 0)
		{
			return NaN;
		}
		
		var highest = Number.MIN_VALUE;
		for(var i=array.length - numberOfFrames; i<array.length; i++) {
			highest = Math.max(highest, array[i]);
		}
		return highest;
	},
	
	getLowestFramerateForLastFrames: function(numberOfFrames) {
		return this._getLowest(this._values, numberOfFrames);
	},
	
	getLowestDurationForLastFrames: function(numberOfFrames) {
		return this._getLowest(this._duration, numberOfFrames);
	},
	
	_getLowest: function(array, numberOfFrames) {
		if (array.length <= 0)
		{
			return NaN;
		}
		
		var lowest = Number.MAX_VALUE;
		for(var i=array.length - numberOfFrames; i<array.length; i++) {
			lowest = Math.min(lowest, array[i]);
		}
		return lowest;
	},
	
	getNumberOfSamples: function() {
		return this._values.length;
	},
	
	getSampleSize: function() {
		return this._maximumNumberToTrack;
	},
	
	calculateDurationInMillisecondsForFps: function(framesPerSecond) {
		return 1000 / framesPerSecond;
	}
};