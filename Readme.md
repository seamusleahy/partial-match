# Partial Match #

Match a string against a pattern including partial matches. It is useful for doing on the fly validation of input fields.

The patterns are a subset of regular expressions.

 * '\\A' : predefined character classes
 * '[...]' : character class
 * '\\.' : any character
 * 'a' : literal value
 * '?' : 0 or 1 occurences of character
 * '+' : 1 or more occurences of character
 * '*' : 0 or more occurences of character
 * '{3}' : an exact number of occurences of character
 * '{3,6}' : an range of occurences of character
 * '{4,}' : a minimum number of occurences of a character

## Example ##
```javascript
var colorPartialMatch = new PartialMatch({
	'3hex': '#[0-9a-fA-F]{3}',
	'6hex': '#[0-9a-fA-F]{6}'
});

var results = colorPartialMatch.match( '#1234' );
```
## Results ##
```json
{
 "complete": {
   "3hex": "#123"
 },
 "partial": {
   "6hex": "#1234"
 },
 "remainder": {
   "3hex": "4"
 },
 "bestMatch": "3hex"
}
```