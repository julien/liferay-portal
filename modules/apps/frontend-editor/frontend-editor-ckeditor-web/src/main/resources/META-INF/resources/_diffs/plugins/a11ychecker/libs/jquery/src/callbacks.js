/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

define(['./core', './core/toType', './var/isFunction', './var/rnothtmlwhite'], (
	jQuery,
	toType,
	isFunction,
	rnothtmlwhite
) => {
	'use strict';

	// Convert String-formatted options into Object-formatted ones

	function createOptions(options) {
		var object = {};
		jQuery.each(options.match(rnothtmlwhite) || [], (_, flag) => {
			object[flag] = true;
		});

		return object;
	}

	/*
	 * Create a callback list using the following parameters:
	 *
	 *	options: an optional list of space-separated options that will change how
	 *			the callback list behaves or a more traditional option object
	 *
	 * By default a callback list will act like an event callback list and can be
	 * "fired" multiple times.
	 *
	 * Possible options:
	 *
	 *	once:			will ensure the callback list can only be fired once (like a Deferred)
	 *
	 *	memory:			will keep track of previous values and will call any callback added
	 *					after the list has been fired right away with the latest "memorized"
	 *					values (like a Deferred)
	 *
	 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
	 *
	 *	stopOnFalse:	interrupt callings when a callback returns false
	 *
	 */
	jQuery.Callbacks = function (options) {

		// Convert options from String-formatted to Object-formatted if needed
		// (we check in cache first)

		options =
			typeof options === 'string'
				? createOptions(options)
				: jQuery.extend({}, options);

		var // Flag to know if list is currently firing
			firing,

			// Last fire value for non-forgettable lists

			memory,

			// Flag to know if list was already fired

			fired,

			// Flag to prevent firing

			locked,

			// Actual callback list

			list = [],

			// Queue of execution data for repeatable lists

			queue = [],

			// Index of currently firing callback (modified by add/remove as needed)

			firingIndex = -1,

			// Fire callbacks

			fire = function () {

				// Enforce single-firing

				locked = locked || options.once;

				// Execute callbacks for all pending executions,
				// respecting firingIndex overrides and runtime changes

				fired = firing = true;
				for (; queue.length; firingIndex = -1) {
					memory = queue.shift();
					while (++firingIndex < list.length) {

						// Run callback and check for early termination

						if (
							list[firingIndex].apply(memory[0], memory[1]) ===
								false &&
							options.stopOnFalse
						) {

							// Jump to end and forget the data so .add doesn't re-fire

							firingIndex = list.length;
							memory = false;
						}
					}
				}

				// Forget the data if we're done with it

				if (!options.memory) {
					memory = false;
				}

				firing = false;

				// Clean up if we're done firing for good

				if (locked) {

					// Keep an empty list if we have data for future add calls

					if (memory) {
						list = [];

						// Otherwise, this object is spent

					}
					else {
						list = '';
					}
				}
			},

			// Actual Callbacks object

			self = {

				// Add a callback or a collection of callbacks to the list

				add() {
					if (list) {

						// If we have memory from a past run, we should fire after adding

						if (memory && !firing) {
							firingIndex = list.length - 1;
							queue.push(memory);
						}

						(function add(args) {
							jQuery.each(args, (_, arg) => {
								if (isFunction(arg)) {
									if (!options.unique || !self.has(arg)) {
										list.push(arg);
									}
								}
								else if (
									arg &&
									arg.length &&
									toType(arg) !== 'string'
								) {

									// Inspect recursively

									add(arg);
								}
							});
						})(arguments);

						if (memory && !firing) {
							fire();
						}
					}

					return this;
				},

				// Remove a callback from the list

				remove() {
					jQuery.each(arguments, (_, arg) => {
						var index;
						while (
							(index = jQuery.inArray(arg, list, index)) > -1
						) {
							list.splice(index, 1);

							// Handle firing indexes

							if (index <= firingIndex) {
								firingIndex--;
							}
						}
					});

					return this;
				},

				// Check if a given callback is in the list.
				// If no argument is given, return whether or not list has callbacks attached.

				has(fn) {
					return fn ? jQuery.inArray(fn, list) > -1 : list.length > 0;
				},

				// Remove all callbacks from the list

				empty() {
					if (list) {
						list = [];
					}

					return this;
				},

				// Disable .fire and .add
				// Abort any current/pending executions
				// Clear all callbacks and values

				disable() {
					locked = queue = [];
					list = memory = '';

					return this;
				},
				disabled() {
					return !list;
				},

				// Disable .fire
				// Also disable .add unless we have memory (since it would have no effect)
				// Abort any pending executions

				lock() {
					locked = queue = [];
					if (!memory && !firing) {
						list = memory = '';
					}

					return this;
				},
				locked() {
					return !!locked;
				},

				// Call all callbacks with the given context and arguments

				fireWith(context, args) {
					if (!locked) {
						args = args || [];
						args = [context, args.slice ? args.slice() : args];
						queue.push(args);
						if (!firing) {
							fire();
						}
					}

					return this;
				},

				// Call all the callbacks with the given arguments

				fire() {
					self.fireWith(this, arguments);

					return this;
				},

				// To know if the callbacks have already been called at least once

				fired() {
					return !!fired;
				},
			};

		return self;
	};

	return jQuery;
});
