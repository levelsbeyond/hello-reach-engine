'use strict';

require('mock-require')('clappr');
require('testdom')('<html><body></body></html>', {
	React: 'react',
	localStorage: 'localStorage'
});