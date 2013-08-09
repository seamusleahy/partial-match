/**
 * Match a string against a pattern including partial matches.
 * It is useful for doing on the fly validation of input fields.
 *
 * The patterns are a subset of regular expressions.
 *  - '\\A' : predefined character classes
 *  - '[...]' : character class
 *  - '\\.' : any character
 *  - 'a' : literal value
 *  - '?' : 0 or 1 occurences of character
 *  - '+' : 1 or more occurences of character
 *  - '*' : 0 or more occurences of character
 *  - '{3}' : an exact number of occurences of character
 *  - '{3,6}' : an range of occurences of character
 *  - '{4,}' : a minimum number of occurences of a character
 * 
 *
 * var colorPartialMatch = new PartialMatch({
 *	'3hex': '#[0-9a-fA-F]{3}',
 *	'6hex': '#[0-9a-fA-F]{6}'
 * });
 *
 * var results = colorPartialMatch.match( '#1234' );
 * =>
 * {
 *  "complete": {
 *    "3hex": "#123"
 *  },
 *  "partial": {
 *    "6hex": "#1234"
 *  },
 *  "remainder": {
 *    "3hex": "4"
 *  },
 *  "bestMatch": "3hex"
 * }
 */

(function() {
	var root = this;
	var parsePatternRe = /^(\[.*?[^\\]\]|\\.|.)([*?+]|\{(\d+)\}|\{(\d+),(\d+)\}|\{(\d+),\})?/i;
	var parsePatternReGroups = { 'charater': 1, 'exactNumberRepeat': 3, 'minRepeat': 4, 'maxRepeat': 5, 'leastRepeat': 6 };
	var error = function() {
		if ( root.console && root.console.log ) {
			root.console.log.apply( root.console, arguments );
		}
	};

	root.PartialMatch = function() {
		this.init.apply( this, arguments );
	};

	root.PartialMatch.prototype = {
		/**
		 * Initialize
		 *
		 * @param object patterns
		 */
		init: function( patterns ) {
			this.patterns = {};
			for ( var name in patterns ) {
				this.patterns[name] = this.parsePattern( patterns[name] );
			}
		},

		/**
		 * Parse a string pattern into the parts
		 */
		parsePattern: function( pattern ) {
			var remaining = pattern;
			var parsed = [];
			var m = true;
			var i, min, max;

			while ( remaining.length && m ) {
				m = remaining.match( parsePatternRe );
				console.log( m );
				if ( m ) {

					if ( m[parsePatternReGroups.exactNumberRepeat] ) {
						// {3}
						i = parseInt( m[parsePatternReGroups.exactNumberRepeat] );
						for ( i; i > 0; --i ) {
							parsed.push( m[parsePatternReGroups.charater] );
						}

					} else if ( m[parsePatternReGroups.minRepeat] ) {
						// {2,5}
						min = parseInt( m[parsePatternReGroups.minRepeat] );
						max = parseInt( m[parsePatternReGroups.maxRepeat] );

						for ( i=max-min; i > 0; --i ) {
							parsed.push( m[parsePatternReGroups.charater] );
						}
						parsed.push( m[parsePatternReGroups.charater]+'{0,'+(max-min)+'}' );
					
					} else if ( m[parsePatternReGroups.leastRepeat] ) {
						// {4,}
						i = parseInt( m[parsePatternReGroups.leastRepeat] );

						for ( i; i > 0; --i ) {
							parsed.push( m[parsePatternReGroups.charater] );
						}
						parsed.push( m[parsePatternReGroups.charater]+'*' );

					} else {
						parsed.push( m[0] );
					}
					remaining = remaining.substr( m[0].length );
				} else {
					error( 'Unable to parse pattern: ', pattern, remaining );
				}
			}

			console.log( pattern, parsed );
			return parsed;
		},

		/**
		 * Match a string
		 *
		 * @param string string
		 *
		 * @return results
		 */
		match: function( input ) {
			var name, i, remainingString, m, matchedString;
			var results = { complete: {}, partial: {}, remainder: {} };


			for ( name in this.patterns ) {
				i = 0;
				remainingString = input;
				m = null;
				matchedString = '';
				while ( i < this.patterns[name].length && ( i == 0 || m ) && remainingString ) {
					m = remainingString.match( new RegExp( '^'+this.patterns[name][i] ) );

					if ( m ) {
						matchedString = matchedString + m[0];
						remainingString = remainingString.substr( m[0].length );
					}

					++i;
				}

				if ( m && i < this.patterns[name].length && !remainingString ) {
					// Partial match
					results.partial[name] = matchedString;
				} else if ( m ) {
					// Complete match
					results.complete[name] = matchedString;
					results.remainder[name] = remainingString;
				}
			}

			// Figure out the best match
			var bestMatch, bestMatchNum;
			for ( name in results.complete ) {
				if ( bestMatchNum == null || results.remainder[name].length < bestMatchNum ) {
					bestMatch = name;
					bestMatchNum = results.remainder[name].length;
				}
			}

			if ( bestMatch ) {
				results.bestMatch = bestMatch;
			}

			return results;
		}
	};

})();
