/*
Copyright 2015 Google Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

(function() {
    var module = angular.module('timesketch.explore.event.directive', []);

    module.directive('tsEventList', ['timesketchApi', function(timesketchApi) {
        /**
         * Render list of events (search result from the datastore).
         * @param sketch-id - The id for the sketch.
         * @param meta - Metadata object returned from the datastore search.
         * @param events - Array of events (search results).
         * @param query - Query string for the search results.
         * @param filter - Filter for the search results.
         */
        return {
            restrict: 'E',
            templateUrl: '/static/components/explore/explore-event-list.html',
            scope: {
                sketchId: '=',
                meta: '=',
                events: '=',
                query: '=',
                filter: '='
            },
            require: '^tsSearch',
            controller: function($scope) {
                var toggleStar = function(event_list) {
                    if (!event_list.length) {return}
                    timesketchApi.saveEventAnnotation(
                        $scope.sketchId,
                        'label',
                        '__ts_star',
                        event_list).success(function (data) {})
                };

                $scope.toggleAll = function() {
                    $scope.isAllSelected = $scope.events.every(function(event) {
                        return event.selected;
                    });
                    angular.forEach($scope.events, function(event) {
                        if (!$scope.isAllSelected) {
                            event.selected = true
                        } else {
                            event.selected = false
                        }
                    })
                };

                $scope.addStar = function() {
                    event_list = [];
                    angular.forEach($scope.events, function(event) {
                        if (event.selected && !event.star) {
                            event.star = true;
                            event_list.push(event);
                        }
                    });
                    toggleStar(event_list)
                };

                $scope.removeStar = function() {
                    event_list = [];
                    angular.forEach($scope.events, function(event) {
                        if (event.selected && event.star) {
                            event.star = false;
                            event_list.push(event);
                        }
                    });
                    toggleStar(event_list)
                };

                $scope.$watch('events', function(value) {
                    if (angular.isDefined(value)) {
                        $scope.anySelected = value.some(function(event) {
                            return event.selected;
                        });
                    }
                }, true)
            },
            link: function(scope, elem, attrs, ctrl) {
                scope.applyOrder = function() {
                    ctrl.search(scope.query, scope.filter);
                }
            }
        }
    }]);

    module.directive('tsEvent', function () {
        /**
         * Render event details.
         * @param sketch-id - The id for the sketch.
         * @param meta - Metadata object returned from the datastore search.
         * @param event - Event object.
         */
        return {
            restrict: 'E',
            templateUrl: '/static/components/explore/explore-event.html',
            scope: {
                sketchId: '=',
                meta: '=',
                event: '=',
                isContextEvent: '='
            },
            require: '^tsSearch',
            controller: function ($scope, timesketchApi) {
                $scope.showDetails = false;

                $scope.toggleSelected = function() {
                    $scope.event.selected = !$scope.event.selected
                };

                $scope.toggleStar = function() {
                    timesketchApi.saveEventAnnotation(
                        $scope.sketchId,
                        'label',
                        '__ts_star',
                        $scope.event).success(function(data) {})
                };

                $scope.getDetail = function() {
                    if ($scope.eventdetail) {return}
                    timesketchApi.getEvent(
                        $scope.sketchId,
                        $scope.event._index,
                        $scope.event._id).success(function(data) {
                            $scope.eventdetail = data.objects;
                            $scope.comments = data.meta.comments;
                        })
                };
                $scope.postComment = function() {
                    timesketchApi.saveEventAnnotation(
                        $scope.sketchId,
                        'comment',
                        $scope.formData.comment,
                        $scope.event).success(function(data) {
                            $scope.formData.comment = '';
                            $scope.commentForm.$setPristine();
                            $scope.comments.push(data['objects'][0][0]);
                            $scope.comment = true;
                        })
                };
                $scope.$watch('event', function(value) {
                    $scope.star = false;
                    $scope.comment = false;
                    if ($scope.event._source.label.indexOf('__ts_star') > -1) {
                        $scope.event.star = true;
                    } else {
                        $scope.event.star = false;
                    }

                    if ($scope.event._source.label.indexOf('__ts_comment') > -1) {
                        $scope.comment = true;
                    }

                });

            },
            link: function(scope, elem, attrs, ctrl) {
                scope.getContext = function(event) {
                    ctrl.getContext(event);
                }
            }
        }
    });

})();

