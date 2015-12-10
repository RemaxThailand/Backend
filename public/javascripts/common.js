var app = angular.module('PowerDD', ['ngStorage']);

app.controller('Backend', function($scope, $localStorage) {
	$scope.$storage = $localStorage.$default({ authKey: '' });

	if ( $scope.$storage.authKey == '' ) {
		console.log('xxx');
	}
	else {
		console.log('yyy');
	}

});