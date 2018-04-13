'use strict';

import PortletInit from '../../src/main/resources/META-INF/resources/liferay/portlet_hub/PortletInit.es';
import RenderState from '../../src/main/resources/META-INF/resources/liferay/portlet_hub/RenderState.es';
import register from '../../src/main/resources/META-INF/resources/liferay/portlet_hub/register.es';
import {portlet} from './MockData.es';

function fetchMock(data) {
	global.fetch = jest.fn().mockImplementation(
		() => {
			return Promise.resolve(
				{
					json: jest.fn().mockImplementation(() => Promise.resolve(data)),
					text: jest.fn().mockImplementation(() => Promise.resolve(JSON.stringify(data)))
				}
			);
		}
	);
}

describe(
	'Portlet Hub',
	() => {

		beforeEach(
			() => {
				PortletInit._renderState = portlet.test.getInitData();
				PortletInit._initialized = true;
			}
		);

		afterEach(
			() => {
			}
		);

		describe(
			'register',
			() => {
				it(
					'should throw error if called without portletId',
					() => {
						expect.assertions(1);

						return register().catch(
							err => {
								expect(err.message).toEqual('Invalid portlet ID');
							}
						);
					}
				);

				it(
					'should return an instance of PortletInit',
					() => {
						return register('portletA').then(
							hub => {
								expect(hub).toBeInstanceOf(PortletInit);
							}
						);
					}
				);
			}
		);

		describe(
			'client events',
			() => {

				afterEach(
					() => {
						PortletInit._clientEventListeners = [];
					}
				);

				it(
					'should add client event listener',
					() => {
						const stub = jest.fn();

						return register('portletA').then(
							hub => {
								hub.addEventListener('clientEvent', stub);

								expect(stub.mock.calls.length).toBe(0);

								hub.dispatchClientEvent('clientEvent');

								expect(stub.mock.calls.length).toBe(1);
							}
						);
					}
				);

				it(
					'should return number of listeners',
					() => {
						const stub = jest.fn();

						return register('portletA').then(
							hub => {
								hub.addEventListener('clientEvent', stub);
								hub.addEventListener('clientEvent', stub);
								hub.addEventListener('clientEvent2', stub);

								expect(stub.mock.calls.length).toBe(0);

								expect(hub.dispatchClientEvent('clientEvent')).toBe(2);
							}
						);
					}
				);

				it(
					'should throw error if addEventListener is called with invalid args',
					() => {
						return register('portletA').then(
							hub => {
								expect(
									() => {
										hub.addEventListener(1, 2, 3);
									}
								).toThrow('Too many arguments passed to addEventListener');

								expect(
									() => {
										hub.addEventListener(1);
									}
								).toThrow('Invalid arguments passed to addEventListener');

								expect(
									() => {
										hub.addEventListener('string', 1);
									}
								).toThrow('Invalid arguments passed to addEventListener');
							}
						);
					}
				);

				it(
					'should not call listener if it is removed',
					() => {
						const stub = jest.fn();

						return register('portletA').then(
							hub => {
								const handle = hub.addEventListener('clientEvent', stub);

								hub.removeEventListener(handle);

								const total = hub.dispatchClientEvent('clientEvent');

								expect(stub.mock.calls.length).toBe(0);
								expect(total).toBe(0);
							}
						);
					}
				);

				it(
					'should throw error if dispatchClientEvent is called with invalid args',
					() => {
						const stub = jest.fn();

						return register('portletA').then(
							hub => {
								expect(
									() => {
										hub.dispatchClientEvent(1, 2, 3);
									}
								).toThrow('Too many arguments passed to dispatchClientEvent');

								expect(
									() => {
										hub.dispatchClientEvent(1);
									}
								).toThrow('Event type must be a string');
							}
						);
					}
				);

				it(
					'should throw error when attempting to dispatch event with protected name',
					() => {
						return register('portletA').then(
							hub => {
								expect(
									() => {
										hub.dispatchClientEvent('portlet.clientEvent');
									}
								).toThrow('The event type is invalid: portlet.clientEvent');
							}
						);
					}
				);

				it(
					'should throw error if removeEventListener is called with invalid args',
					() => {
						return register('portletA').then(
							hub => {
								expect(
									() => {
										hub.removeEventListener(1, 2);
									}
								).toThrow('Too many arguments passed to removeEventListener');

								expect(
									() => {
										hub.removeEventListener();
									}
								).toThrow('The event handle provided is undefined');

								expect(
									() => {
										hub.removeEventListener({});
									}
								).toThrow('The event listener handle doesn\'t match any listeners.');
							}
						);
					}
				);

				it(
					'should call listener with matching wildcard event types',
					() => {
						const stub = jest.fn();

						return register('portletA').then(
							hub => {
								const handle = hub.addEventListener('Event$', stub);

								const total = hub.dispatchClientEvent('clientEvent');

								expect(stub.mock.calls.length).toBe(1);
								expect(total).toBe(1);
							}
						);
					}
				);
			}
		);

		describe(
			'the newState function',
			() => {
				it(
					'should return a new RenderState object',
					() => {
						expect.assertions(3);

						return register('portletB')
							.then(
								hub => {
									const rs = hub.newState(
										{
											parameters: {
												a: [1, 2, 3],
												b: [4]
											},
											portletMode: 'view',
											windowState: 'normal'
										}
									);

									expect(rs.getValues('a')).toEqual(expect.arrayContaining([1, 2, 3]));
									expect(rs.getValue('b')).toEqual(4);
									expect(rs.portletMode).toEqual('view');
								}
							);
					}
				);
			}
		);

		describe(
			'the newParams function',
			() => {
				it(
					'should return new parameters according to the data passed',
					() => {
						expect.assertions(4);

						return register('portletC').then(
							hub => {

								const params1 = {
									a: [1, 2, 3],
									b: null,
									c: 'foo',
									d: ['four', 'five', 'six']
								};

								const params2 = hub.newParameters(params1);

								expect(params2.a).toEqual(expect.arrayContaining([1, 2, 3]));
								expect(params2.b).not.toBeDefined();
								expect(params2.c).not.toBeDefined();
								expect(params2.d).toEqual(expect.arrayContaining(['four', 'five', 'six']));
							}
						);
					}
				);
			}
		);

		describe(
			'the action function',
			() => {
				const ids = portlet.test.getIds();
				const onStateChange = jest.fn();
				const pageState = portlet.test.getInitData();
				const portletA = ids[0];
				const portletB = ids[1];
				const portletC = ids[2];
				const portletD = ids[3];

				let hubA;
				let hubB;
				let listenerA;

				beforeEach(
					() => {
						fetchMock(
							[
								portletA
							]
						);

						return Promise.all(
							[
								register(portletA),
								register(portletB)
							]
						)
							.then(
								values => {
									hubA = values[0];
									listenerA = hubA.addEventListener(
										'portlet.onStateChange',
										onStateChange
									);

									hubB = values[1];
								}
							);
					}
				);

				afterEach(
					() => {
						global.fetch.mockRestore();

						hubA.removeEventListener(listenerA);
						hubA = null;
						hubB = null;
					}
				);

				it(
					'is present in the register return object and is a function',
					() => {
						expect(hubA.action).toBeInstanceOf(Function);
					}
				);

				it(
					'throws a TypeError if too many (>2) arguments are provided',
					() => {
						const el = document.createElement('form');
						const parms = {rp1: ['resVal']};

						return hubA.action(
							parms,
							el,
							'parm3'
						)
							.catch(
								err => {
									expect(err.name).toEqual('TypeError');
									expect(err.message).toEqual('Invalid argument type. Argument 3 is of type [object String]');
								}
							);
					}
				);

				it(
					'throws a TypeError if a single argument is null',
					() => {
						return hubA.action(
							null
						)
							.catch(
								err => {
									expect(err.name).toEqual('TypeError');
									expect(err.message).toEqual('Invalid argument type. Argument 1 is of type [object Null]');
								}
							);
					}
				);

				it(
					'throws a TypeError if the element argument is null',
					() => {
						const parms = {rp1: ['resVal']};

						hubA.action(
							parms,
							null
						)
							.catch(
								err => {
									expect(err.name).toEqual('TypeError');
									expect(err.message).toEqual('Invalid argument type. Argument 2 is of type [object Null]');
								}
							);
					}
				);

				it(
					'throws a TypeError if action parameters is null',
					() => {
						const el = document.createElement('form');

						hubA.action(
							null,
							el
						)
							.catch(
								err => {
									expect(err.name).toEqual('TypeError');
									expect(err.message).toEqual('Invalid argument type. Argument 1 is of type [object Null]');
								}
							);
					}
				);

				it(
					'throws a TypeError if action parameters is invalid',
					() => {
						const el = document.createElement('form');
						const parms = {rp1: 'resVal'};

						hubA.action(
							parms,
							el
						)
							.catch(
								err => {
									expect(err.name).toEqual('TypeError');
									expect(err.message).toEqual('rp1 parameter is not an array');
								}
							);
					}
				);

				it(
					'throws a TypeError if the element argument is invalid',
					() => {
						const el = document.createElement('form');
						const parms = {rp1: ['resVal']};

						hubA.action(
							parms,
							'Invalid'
						)
							.catch(
								err => {
									expect(err.name).toEqual('TypeError');
									expect(err.message).toEqual('Invalid argument type. Argument 2 is of type [object String]');
								}
							);
					}
				);

				it(
					'throws a TypeError if there are 2 element arguments',
					() => {
						const el = document.createElement('form');
						const parms = {rp1: ['resVal']};

						return hubA.action(
							el,
							el
						)
							.catch(
								err => {
									expect(err.name).toEqual('TypeError');
									expect(err.message).toEqual('Too many [object HTMLFormElement] arguments: [object HTMLFormElement], [object HTMLFormElement]');
								}
							);
					}
				);

				it(
					'throws a TypeError if there are 2 action parameters arguments',
					() => {
						const parms = {rp1: ['resVal']};

						return hubA.action(
							parms,
							parms
						)
							.catch(
								err => {
									expect(err.name).toEqual('TypeError');
									expect(err.message).toEqual('Too many parameters arguments');
								}
							);
					}
				);

				it(
					'does not throw if both arguments are valid',
					() => {
						const el = document.createElement('form');
						const parms = {rp1: ['resVal']};

						return hubA.action(
							parms,
							el
						)
							.then(
								upids => {
									expect(onStateChange).toHaveBeenCalled();
								}
							);
					}
				);

				it(
					'throws an AccessDeniedException if action is called twice',
					() => {
						const el = document.createElement('form');
						const parms = {rp1: ['resVal']};

						return Promise.all(
							[
								hubA.action(parms, el),
								hubA.action(parms, el)
							]
						)
							.catch(
								err => {

									// TODO: Maybe we shouldn't use typical 'Java' style exception names
									// i.e. in JS the standard or typical convention is 'Error' and not 'Exception'

									expect(err.name).toEqual('AccessDeniedException');
									expect(err.message).toEqual('Operation is already in progress');
								}
							);
					}
				);

				// TODO: Fix test!

				it(
					'throws an NotInitializedException if no onStateChange listener is registered.',
					() => {
						fetchMock([portletA]);

						const el = document.createElement('form');
						const parms = {rp1: ['resVal']};

						return hubB.action(
							parms,
							el
						)
							.catch(
								err => {
									global.fetch.mockRestore();

									expect(err.name).toEqual('NotInitializedException');
									expect(err.message).toEqual('No onStateChange listener registered for portlet: PortletB');
								}
							);
					}
				);

				// TODO: Check test data!
				// @see: https://github.com/apache/portals-pluto/blob/master/portlet-api/src/test/javascript/ActionTest.js#L270

				it(
					'causes the onStateChange listener to be called and state is as expected',
					done => {
						const el = document.createElement('form');
						const parms = {rp1: ['resVal']};

						return hubA.action(
							parms,
							el
						).then(
							upids => {
								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();
										done();
									}
								);
							}
						);
					}
				);

				// TODO: Impelement test
				// https://github.com/apache/portals-pluto/blob/master/portlet-api/src/test/javascript/ActionTest.js#L285
				// it('allows a resource URL to be created containing the render state', () => {
				// 	const parms = {rp1: ['resVal'], rp2: ['resVal2']};
				// 	const cache = 'cacheLevelPage';
				// 	return hubA.createResourceUrl(parms, cache).then(url => {
				// 	});
				// });

			}
		);

		describe(
			'actions affect multiple portlets',
			() => {
				const onStateChangeA = jest.fn();
				const onStateChangeB = jest.fn();
				const onStateChangeC = jest.fn();
				const onStateChangeD = jest.fn();

				const ids = portlet.test.getIds();
				const pageState = portlet.test.getInitData();
				const portletA = ids[0];
				const portletB = ids[1];
				const portletC = ids[2];
				const portletD = ids[3];

				let hubA;
				let hubB;
				let hubC;
				let hubD;
				let listenerA;
				let listenerB;
				let listenerC;
				let listenerD;
				let listenerZ;

				beforeEach(
					() => {
						return Promise.all(
							[
								register(portletA),
								register(portletB),
								register(portletC),
								register(portletD)
							]
						)
							.then(
								values => {
									hubA = values[0];
									listenerA = hubA.addEventListener(
										'portlet.onStateChange',
										onStateChangeA
									);
									onStateChangeA.mockClear();

									hubB = values[1];
									listenerB = hubB.addEventListener(
										'portlet.onStateChange',
										onStateChangeB
									);
									onStateChangeB.mockClear();

									hubC = values[2];
									listenerC = hubC.addEventListener(
										'portlet.onStateChange',
										onStateChangeC
									);
									onStateChangeC.mockClear();

									hubD = values[3];
									listenerD = hubD.addEventListener(
										'portlet.onStateChange',
										onStateChangeD
									);
									onStateChangeD.mockClear();
								}
							);
					}
				);

				afterEach(
					() => {
						hubA.removeEventListener(listenerA);
						hubB.removeEventListener(listenerB);
						hubC.removeEventListener(listenerC);
						hubD.removeEventListener(listenerD);
					}
				);

				it(
					'throws an AccessDeniedException if called before previous action completes',
					done => {
						fetchMock([portletA]);

						const el = document.createElement('form');
						const parms = {rp1: ['resVal']};

						onStateChangeA.mockClear();
						onStateChangeB.mockClear();

						const fnA = () => hubA.action(parms, el);
						const fnB = () => hubB.action(parms, el).catch(err => err);

						return Promise.all(
							[fnA(), fnB()]
						)
							.then(
								values => {
									const err = values[1];
									expect(err.message).toEqual('Operation is already in progress');
									expect(err.name).toEqual('AccessDeniedException');
									expect(onStateChangeB).not.toHaveBeenCalled();
									done();
								}
							);
					}
				);

				it(
					'allows actions that update the state of 2 portlets. other portlets are not updated',
					() => {
						fetchMock([portletB, portletC]);

						const el = document.createElement('form');
						const parms = {rp1: ['resVal']};

						return hubB.action(
							parms,
							el
						)
							.then(
								upids => {
									global.fetch.mockRestore();

									// TODO: Add asertions to compare "states"
									// @see: https://github.com/apache/portals-pluto/blob/master/portlet-api/src/test/javascript/ActionTest.js#L375

									expect(onStateChangeA).not.toHaveBeenCalled();
									expect(onStateChangeD).not.toHaveBeenCalled();
								}
							);
					}
				);
			}
		);

		describe(
			'provides the ability to add and remove event listeners',
			() => {
				const ids = portlet.test.getIds();
				const pageState = portlet.test.getInitData().portlets;
				const portletA = ids[0];
				const portletB = ids[3];
				const portletC = ids[1];

				let hubA;
				let hubB;

				beforeEach(
					() => {
						return Promise.all(
							[
								register(portletA),
								register(portletB)
							]
						)
							.then(
								values => {
									hubA = values[0];
									hubB = values[1];
								}
							);
					}
				);

				afterEach(
					() => {
						PortletInit._clientEventListeners = [];
						PortletInit._systemEventListeners = [];
					}
				);

				it(
					'is present in the register return object and is a function',
					() => {
						expect(typeof hubA.addEventListener).toEqual('function');
					}
				);

				it(
					'throws a TypeError if no argument is provided',
					() => {
						const testFunc = () => {
							hubA.addEventListener();
						};

						expect(testFunc).toThrow(TypeError);
					}
				);

				it(
					'throws a TypeError if 1 argument is provided',
					() => {
						const testFunc = () => {
							hubA.addEventListener('someEvent');
						};

						expect(testFunc).toThrow(TypeError);
					}
				);

				it(
					'throws a TypeError if too many (>2) arguments are provided',
					() => {
						const testFunc = () => {
							hubA.addEventListener('parm1', 'parm2', 'parm3');
						};

						expect(testFunc).toThrow(TypeError);
					}
				);

				it(
					'throws a TypeError if the type argument is not a string',
					() => {
						const testFunc = () => {
							hubA.addEventListener(89, function(type, data) {});
						};

						expect(testFunc).toThrow(TypeError);
					}
				);

				it(
					'throws a TypeError if the function argument is not a function',
					() => {
						const testFunc = () => {
							hubA.addEventListener('someEvent', 89);
						};

						expect(testFunc).toThrow(TypeError);
					}
				);

				it(
					'throws a TypeError if the type is null',
					() => {
						const testFunc = () => {
							hubA.addEventListener(null, function(type, data) {});
						};

						expect(testFunc).toThrow(TypeError);
					}
				);

				it(
					'throws a TypeError if the function is null',
					() => {
						const testFunc = () => {
							hubA.addEventListener('someEvent', null);
						};

						expect(testFunc).toThrow(TypeError);
					}
				);

				it(
					'throws a TypeError if the type begins with "portlet." but is neither "portlet.onStateChange" or "portlet.onError"',
					() => {
						const testFunc = () => {
							hubA.addEventListener(
								'portlet.invalidType',
								function(type, data) {}
							);
						};

						expect(testFunc).toThrow(TypeError);
					}
				);

				it(
					'does not throw an exception if both parameters are valid',
					() => {
						const testFunc = () => {
							return hubA.addEventListener(
								'someEvent',
								function(type, data) {}
							);
						};

						expect(testFunc).not.toThrow();

						const handle = testFunc();
						hubA.removeEventListener(handle);
					}
				);

				it(
					'returns a handle to the event handler (an object) when the parameters are valid',
					() => {
						const handle = hubA.addEventListener('someEvent', function(type, data) {});
						expect(handle).not.toBeUndefined();

						hubA.removeEventListener(handle);
					}
				);

				it(
					'allows a listener for event type "portlet.onStateChange" to be added',
					() => {
						const testFunc = () => {
							return hubA.addEventListener(
								'portlet.onStateChange',
								function(type, data) {}
							);
						};

						expect(testFunc).not.toThrow();

						const handle = testFunc();
						expect(handle).not.toBeUndefined();
						hubA.removeEventListener(handle);
					}
				);

				it(
					'allows a listener for event type "portlet.onError" to be added',
					() => {
						const testFunc = () => {
							return hubA.addEventListener(
								'portlet.onError',
								function(type, data) {}
							);
						};

						expect(testFunc).not.toThrow();

						const handle = testFunc();

						expect(handle).not.toBeUndefined();

						hubA.removeEventListener(handle);
					}
				);

				describe(
					'the removeEventListener function',
					() => {
						it(
							'is present in the register return object and is a function',
							() => {
								expect(hubA.removeEventListener).toBeDefined();
								expect(typeof hubA.removeEventListener).toEqual('function');
							}
						);

						it(
							'throws a TypeError if too many (>1) arguments are provided',
							() => {
								const testFunc = () => {
									hubA.removeEventListener(
										'parm1',
										'parm2',
										'parm3'
									);
								};
								expect(testFunc).toThrow(TypeError);
							}
						);

						it(
							'throws a TypeError if the handle is null',
							() => {
								const testFunc = () => {
									hubA.removeEventListener(null);
								};

								expect(testFunc).toThrow(TypeError);
							}
						);

						it(
							'throws a TypeError if the handle is undefined',
							() => {
								const testFunc = () => {
									hubA.removeEventListener(undefined);
								};

								expect(testFunc).toThrow(TypeError);
							}
						);

						it(
							'throws a TypeError if the handle has an invalid value',
							() => {
								const testFunc = () => {
									hubA.removeEventListener('This is an invalid handle.');
								};

								expect(testFunc).toThrow(TypeError);
							}
						);

						it(
							'allows a previously added user event listener to be removed',
							() => {
								const listener = jest.fn();

								const handle = hubA.addEventListener(
									'anEvent',
									listener
								);

								const testFunc = () => {
									hubA.removeEventListener(handle);
								};

								expect(testFunc).not.toThrow();
							}
						);

						it(
							'allows a previously added portlet.onStateChange event listener to be removed',
							() => {
								const listener = jest.fn();

								const handle = hubA.addEventListener(
									'portlet.onStateChange',
									listener
								);

								const testFunc = () => {
									hubA.removeEventListener(handle);
								};

								expect(testFunc).not.toThrow();
							}
						);

						it(
							'allows a previously added portlet.onError event listener to be removed',
							() => {
								const listener = jest.fn();

								const handle = hubA.addEventListener(
									'portlet.onError',
									listener
								);

								const testFunc = () => {
									hubA.removeEventListener(handle);
								};

								expect(testFunc).not.toThrow();
							}
						);

						it(
							'throws a TypeError if the user event handler is removed twice',
							() => {
								const listener = jest.fn();

								const handle = hubA.addEventListener(
									'anEvent',
									listener
								);

								hubA.removeEventListener(handle);

								const testFunc = () => {
									hubA.removeEventListener(handle);
								};

								expect(testFunc).toThrow(TypeError);
							}
						);

						it(
							'throws a TypeError if the onStateChange event handler is removed twice',
							() => {
								const listener = jest.fn();

								const handle = hubA.addEventListener(
									'portlet.onStateChange',
									listener
								);

								hubA.removeEventListener(handle);

								const testFunc = () => {
									hubA.removeEventListener(handle);
								};

								expect(testFunc).toThrow(TypeError);
							}
						);

						it(
							'throws a TypeError if the onError event handler is removed twice',
							() => {
								const listener = jest.fn();

								const handle = hubA.addEventListener(
									'portlet.onError',
									listener
								);

								hubA.removeEventListener(handle);

								const testFunc = () => {
									hubA.removeEventListener(handle);
								};

								expect(testFunc).toThrow(TypeError);
							}
						);
					}
				);

				describe(
					'onStateChange without render data',
					() => {
						const eventType = 'portlet.onStateChange';

						let retRenderData;
						let retRenderState;
						let retType;

						const onStateChange = jest.fn(
							(eventType, renderState, renderData) => {
								retType = eventType;
								retRenderState = renderState;
								retRenderData = renderData;
							}
						);

						beforeEach(
							() => {
								onStateChange.mockClear();
								retType = retRenderState = retRenderData = undefined;
							}
						);

						afterEach(
							() => {

							}
						);

						it(
							'does not call the portlet.onStateChange listener during the addEventListener call',
							() => {
								const handle = hubA.addEventListener(
									eventType,
									onStateChange
								);

								expect(onStateChange).not.toHaveBeenCalled();
								hubA.removeEventListener(handle);
							}
						);

						it(
							'is called asynchronously after an onStateChange handler is registered',
							done => {
								const handle = hubA.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();
										hubA.removeEventListener(handle);
										done();
									}
								);
							}
						);

						it(
							'is passed a type parameter with value "portlet.onStateChange"',
							done => {
								const handle = hubA.addEventListener(
									eventType,
									onStateChange
								);

								const renderState = new RenderState(pageState[portletA].state);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();
										expect(onStateChange.mock.calls[0][0]).toEqual(eventType);
										hubA.removeEventListener(handle);
										done();
									}
								);
							}
						);

						// portletA is set up not to have render data

						it(
							'is not passed a RenderData object',
							done => {
								const handle = hubA.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {

										expect(onStateChange).toHaveBeenCalled();

										// No render data was passed

										expect(onStateChange.mock.calls[0]).toHaveLength(2);
										expect(retRenderData).not.toBeDefined();

										hubA.removeEventListener(handle);
										done();
									}
								);
							}
						);

						it(
							'is passed a RenderState parameter that has 3 properties',
							done => {
								const handle = hubA.addEventListener(
									eventType,
									onStateChange
								);

								const originalState = pageState[portletA].state;

								const originalKeys = Object.keys(originalState);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderState = onStateChange.mock.calls[0][1];

										const keys = Object.keys(renderState);

										expect(keys).toHaveLength(3);
										expect(retRenderState).toEqual(renderState);

										hubA.removeEventListener(handle);
										done();
									}
								);
							}
						);

						it(
							'is passed a RenderState object with a "parameters" property',
							done => {
								const handle = hubA.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderState = onStateChange.mock.calls[0][1];

										expect(renderState.parameters).not.toBeUndefined();
										expect(retRenderState.parameters).not.toBeUndefined();
										expect(retRenderState.parameters).toEqual(renderState.parameters);

										hubA.removeEventListener(handle);
										done();
									}
								);
							}
						);

						it(
							'is passed a RenderState object with a "portletMode" property',
							done => {
								const handle = hubA.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderState = onStateChange.mock.calls[0][1];

										expect(retRenderState).not.toBeUndefined();
										expect(retRenderState.portletMode).not.toBeUndefined();
										expect(retRenderState.portletMode).toEqual(renderState.portletMode);

										hubA.removeEventListener(handle);
										done();
									}
								);
							}
						);

						it(
							'is passed a RenderState object with a "windowState" property',
							done => {
								const handle = hubA.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderState = onStateChange.mock.calls[0][1];

										expect(renderState.windowState).not.toBeUndefined();
										expect(retRenderState).not.toBeUndefined();
										expect(retRenderState.windowState).toEqual(renderState.windowState);

										hubA.removeEventListener(handle);
										done();
									}
								);
							}
						);

						it(
							'its RenderState "parameters" property is an object',
							done => {
								expect.assertions(3);

								const handle = hubA.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderState = onStateChange.mock.calls[0][1];

										expect(renderState.parameters).not.toBeUndefined();
										expect(typeof renderState.parameters).toEqual('object');

										hubA.removeEventListener(handle);
										done();
									}
								);
							}
						);

						it(
							'its RenderState has 3 parameters',
							done => {
								expect.assertions(2);

								const handle = hubA.addEventListener(
									eventType,
									onStateChange
								);

								const params = pageState[portletA].state.parameters;
								const parmCnt = Object.keys(params).length;

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const retParams = retRenderState.parameters;
										const retParmCnt = Object.keys(retParams).length;
										expect(retParmCnt).toEqual(parmCnt);

										hubA.removeEventListener(handle);
										done();
									}
								);
							}
						);

						it(
							'its RenderState "windowState" property is a string',
							done => {
								expect.assertions(6);

								const handle = hubA.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderState = onStateChange.mock.calls[0][1];

										expect(retRenderState.windowState).not.toBeUndefined();
										expect(typeof retRenderState.windowState).toEqual('string');
										expect(renderState.windowState).not.toBeUndefined();
										expect(typeof renderState.windowState).toEqual('string');
										expect(renderState.windowState).toEqual(retRenderState.windowState);

										hubA.removeEventListener(handle);
										done();
									}
								);
							}
						);

						it(
							'its RenderState "portletMode" property is a string',
							done => {
								expect.assertions(6);

								const handle = hubA.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderState = onStateChange.mock.calls[0][1];

										expect(retRenderState.portletMode).not.toBeUndefined();
										expect(typeof retRenderState.portletMode).toEqual('string');
										expect(renderState.portletMode).not.toBeUndefined();
										expect(typeof renderState.portletMode).toEqual('string');
										expect(renderState.portletMode).toEqual(retRenderState.portletMode);

										hubA.removeEventListener(handle);
										done();
									}
								);
							}
						);

						it(
							`its RenderState has windowState=${pageState[portletA].state.windowState}`,
							done => {
								expect.assertions(4);

								const handle = hubA.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderState = onStateChange.mock.calls[0][1];

										expect(retRenderState.windowState).toEqual(renderState.windowState);
										expect(retRenderState.windowState).toEqual(pageState[portletA].state.windowState);
										expect(renderState.windowState).toEqual(pageState[portletA].state.windowState);

										hubA.removeEventListener(handle);
										done();
									}
								);
							}
						);

						it(
							`its RenderState has portletMode=${pageState[portletA].state.portletMode}`,
							done => {
								expect.assertions(4);

								const handle = hubA.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderState = onStateChange.mock.calls[0][1];

										expect(retRenderState.portletMode).toEqual(renderState.portletMode);
										expect(retRenderState.portletMode).toEqual(pageState[portletA].state.portletMode);
										expect(renderState.portletMode).toEqual(pageState[portletA].state.portletMode);

										hubA.removeEventListener(handle);
										done();
									}
								);
							}
						);

						it(
							'its RenderState parameter is not identical to the test state object"',
							done => {
								expect.assertions(4);

								const handle = hubA.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderState = onStateChange.mock.calls[0][1];

										expect(renderState).not.toBe(pageState[portletA].state);
										expect(retRenderState).not.toBe(pageState[portletA].state);
										expect(retRenderState).toEqual(renderState);

										hubA.removeEventListener(handle);
										done();
									}
								);
							}
						);

						it(
							'its RenderState parameter equals the test state object"',
							done => {
								expect.assertions(4);

								const handle = hubA.addEventListener(
									eventType,
									onStateChange
								);

								const testState = hubA.newState(pageState[portletA].state);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderState = onStateChange.mock.calls[0][1];

										expect(retRenderState).toEqual(testState);
										expect(renderState).toEqual(testState);
										expect(renderState).toEqual(retRenderState);

										hubA.removeEventListener(handle);
										done();
									}
								);
							}
						);
					}
				);

				describe(
					'onStateChange with render data',
					() => {

						const eventType = 'portlet.onStateChange';

						let complete = false;
						let handle = null;
						let retRenderData;
						let retRenderState;
						let retType;

						const onStateChange = jest.fn(
							(eventType, renderState, renderData) => {
								complete = true;
								retType = eventType;
								retRenderState = renderState;
								retRenderData = renderData;
							}
						);

						beforeEach(
							() => {
								onStateChange.mockClear();
								complete = false;
								retType = retRenderState = retRenderData = undefined;
							}
						);

						// Remove the listener added during the test

						afterEach(
							() => {
								if (handle !== null) {
									hubB.removeEventListener(handle);
									handle = null;
								}
							}
						);

						it(
							'does not call the portlet.onStateChange listener during the addEventListener call',
							() => {
								handle = hubB.addEventListener(
									eventType,
									onStateChange
								);

								expect(complete).toBeFalsy();
								expect(onStateChange).not.toHaveBeenCalled();
							}
						);

						it(
							'is called asynchronously after an onStateChange handler is registered',
							done => {
								handle = hubB.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();
										expect(complete).toBeTruthy();

										done();
									}
								);
							}
						);

						it(
							'is passed a type parameter with value "portlet.onStateChange"',
							done => {
								handle = hubB.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();
										expect(complete).toBeTruthy();
										expect(retType).toEqual(eventType);

										done();
									}
								);
							}
						);

						it(
							'is passed a RenderState parameter that is an object',
							done => {
								handle = hubB.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderState = onStateChange.mock.calls[0][1];

										expect(typeof renderState).toEqual('object');
										expect(renderState).toEqual(retRenderState);
										expect(typeof renderState).toEqual(typeof retRenderState);

										done();
									}
								);
							}
						);

						it(
							'is passed a RenderState parameter that has 3 properties',
							done => {
								handle = hubB.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderState = onStateChange.mock.calls[0][1];

										const cnt = Object.keys(retRenderState).length;

										expect(cnt).toEqual(3);
										expect(Object.keys(renderState).length).toEqual(cnt);

										expect(renderState).toEqual(retRenderState);

										done();
									}
								);
							}
						);

						it(
							'is passed a RenderState object with a "parameters" property',
							done => {
								handle = hubB.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderState = onStateChange.mock.calls[0][1];

										expect(renderState.parameters).not.toBeUndefined();
										expect(retRenderState.parameters).not.toBeUndefined();
										expect(renderState.parameters).toEqual(renderState.parameters);

										done();
									}
								);
							}
						);

						it(
							'is passed a RenderState object with a "portletMode" property',
							done => {
								handle = hubB.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderState = onStateChange.mock.calls[0][1];

										expect(renderState.portletMode).not.toBeUndefined();
										expect(retRenderState.portletMode).not.toBeUndefined();
										expect(renderState.portletMode).toEqual(renderState.portletMode);

										done();
									}
								);
							}
						);

						it(
							'is passed a RenderState object with a "windowState" property',
							done => {
								handle = hubB.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderState = onStateChange.mock.calls[0][1];

										expect(renderState.windowState).not.toBeUndefined();
										expect(retRenderState.windowState).not.toBeUndefined();
										expect(renderState.windowState).toEqual(renderState.windowState);

										done();
									}
								);
							}
						);

						it(
							'its RenderState parameter is not identical to the test state object"',
							done => {
								handle = hubB.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderState = onStateChange.mock.calls[0][1];

										expect(renderState).not.toBe(pageState[portletB].state);
										expect(retRenderState).not.toBe(pageState[portletB].state);

										done();
									}
								);
							}
						);

						it(
							'its RenderState parameter equals the test state object"',
							done => {
								handle = hubB.addEventListener(
									eventType,
									onStateChange
								);

								const testState = hubA.newState(pageState[portletB].state);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderState = onStateChange.mock.calls[0][1];

										expect(renderState).toEqual(testState);
										expect(retRenderState).toEqual(testState);

										done();
									}
								);
							}
						);

						// portletB (which is actually PortletD in the ) is set up to have render data

						it(
							'is passed a RenderData object',
							done => {
								handle = hubB.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderData = onStateChange.mock.calls[0][2];

										expect(renderData).not.toBeUndefined();
										expect(typeof retRenderData).toEqual('object');

										done();
									}
								);
							}
						);

						it(
							'is passed a RenderData parameter that has 2 properties',
							done => {
								handle = hubB.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderData = onStateChange.mock.calls[0][2];
										expect(renderData).toEqual(retRenderData);

										const cnt = Object.keys(retRenderData).length;

										expect(cnt).toEqual(2);
										done();
									}
								);
							}
						);

						it(
							'is passed a RenderData object with a "content" property',
							done => {
								handle = hubB.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderData = onStateChange.mock.calls[0][2];

										expect(renderData).toEqual(retRenderData);
										expect(renderData.content).not.toBeUndefined();

										done();
									}
								);
							}
						);

						it(
							'is passed a RenderData object with a "mimeType" property',
							done => {
								handle = hubB.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderData = onStateChange.mock.calls[0][2];

										expect(renderData).toEqual(retRenderData);
										expect(renderData.mimeType).not.toBeUndefined();

										done();
									}
								);
							}
						);

						it(
							'is passed a RenderData object with a "content" property of type string',
							done => {
								handle = hubB.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderData = onStateChange.mock.calls[0][2];

										expect(renderData).toEqual(retRenderData);
										expect(renderData.content).not.toBeUndefined();
										expect(typeof renderData.content).toEqual('string');

										done();
									}
								);
							}
						);

						it(
							'is passed a RenderData object with a "mimeType" property of type string',
							done => {
								handle = hubB.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderData = onStateChange.mock.calls[0][2];

										expect(renderData).toEqual(retRenderData);
										expect(renderData.mimeType).not.toBeUndefined();
										expect(typeof renderData.mimeType).toEqual('string');

										done();
									}
								);
							}
						);

						it(
							'its RenderData parameter equals the test render data object"',
							done => {
								handle = hubB.addEventListener(
									eventType,
									onStateChange
								);

								setTimeout(
									() => {
										expect(onStateChange).toHaveBeenCalled();

										const renderData = onStateChange.mock.calls[0][2];

										expect(renderData).toEqual(pageState[portletB].renderData);
										expect(retRenderData).toEqual(pageState[portletB].renderData);

										done();
									}
								);
							}
						);
					}
				);
			}
		);

		describe(
			'allows the portlet client to dispatch events',
			() => {
				const ids = portlet.test.getIds();
				const portletA = ids[0];
				const portletB = ids[1];
				const portletC = ids[2];
				const portletD = ids[3];

				// Test data provided by the portlet hub

				const pageState = portlet.test.getInitData();

				let hubA;
				let hubB;
				let hubC;
				let hubD;

				beforeEach(
					() => {
						return Promise.all(
							[
								register(portletA),
								register(portletB),
								register(portletC),
								register(portletD)
							]
						)
							.then(
								values => {
									hubA = values[0];
									hubB = values[1];
									hubC = values[2];
									hubD = values[2];
								}
							);
					}
				);

				describe(
					'the portlet hub is initialized for the tests',
					() => {

						it(
							'initializes a portlet hub instance for portlet A',
							() => {
								expect(hubA).not.toBeUndefined();
							}
						);

						it(
							'initializes a portlet hub instance for portlet B',
							() => {
								expect(hubB).not.toBeUndefined();
							}
						);

						it(
							'initializes a portlet hub instance for portlet C',
							() => {
								expect(hubC).not.toBeUndefined();
							}
						);

						it(
							'initializes a portlet hub instance for portlet D',
							() => {
								expect(hubD).not.toBeUndefined();
							}
						);
					}
				);

				describe(
					'the portlet hub dispatchClientEvent function',
					() => {

						it(
							'is present in the register return object and is a function',
							() => {
								expect(typeof hubA.dispatchClientEvent).toEqual('function');
							}
						);

						it(
							'throws a TypeError if no argument is provided',
							() => {
								const testFunc = () => {
									hubA.dispatchClientEvent();
								};

								expect(testFunc).toThrow(TypeError);
							}
						);

						// TODO
						// @see: https://github.com/apache/portals-pluto/blob/master/portlet-api/src/test/javascript/DispatchClientEventTest.js#L181
						// And decide what to do

						xit(
							'throws a TypeError if 1 argument is provided',
							() => {
								const testFunc = () => {
									hubA.dispatchClientEvent(
										'myType'
									);
								};

								expect(testFunc).toThrow(TypeError);
							}
						);

						it(
							'throws a TypeError if too many (>2) arguments are provided',
							() => {
								const testFunc = () => {
									hubA.dispatchClientEvent(
										'parm1',
										'parm2',
										'parm3'
									);
								};
								expect(testFunc).toThrow(TypeError);
							}
						);

						it(
							'throws a TypeError if the type argument is not a string',
							() => {
								const testFunc = () => {
									hubA.dispatchClientEvent(
										89,
										'aPayload'
									);
								};

								expect(testFunc).toThrow(TypeError);
							}
						);

						it(
							'throws a TypeError if the type is null',
							() => {
								const testFunc = () => {
									hubA.dispatchClientEvent(
										null,
										'aPayload'
									);
								};

								expect(testFunc).toThrow(TypeError);
							}
						);

						it(
							'does not throw an Exception if the payload is null',
							() => {
								const testFunc = () => {
									hubA.dispatchClientEvent(
										'anEvent',
										null
									);
								};

								expect(testFunc).not.toThrow();
							}
						);

						it(
							'throws a TypeError if the type begins with "portlet."',
							() => {
								const testFunc = () => {
									hubA.dispatchClientEvent(
										'portlet.invalidType',
										'aPayload'
									);
								};

								expect(testFunc).toThrow(TypeError);
							}
						);

						it(
							'throws a TypeError if the type matches a system event type',
							() => {
								const testFunc = () => {
									hubA.dispatchClientEvent(
										'portlet.onStateChange',
										'aPayload'
									);
								};

								expect(testFunc).toThrow(TypeError);
							}
						);

						it(
							'does not throw an exception if both parameters are valid',
							() => {
								const testFunc = () => {
									hubA.dispatchClientEvent(
										'anEvent',
										'aPayload'
									);
								};

								expect(testFunc).not.toThrow();
							}
						);

						it(
							'returns count of 0 when no listener for event is registered',
							() => {
								const cnt = hubA.dispatchClientEvent(
									'anEvent',
									'aPayload'
								);

								expect(cnt).toEqual(0);
							}
						);

						it(
							'listener is called & count=1 when 1 listener for event is registered',
							() => {
								const listener = jest.fn();
								const payload = 'aPayload';
								const type = 'anEvent';

								const handle = hubA.addEventListener(
									type,
									listener
								);

								const cnt = hubA.dispatchClientEvent(
									type,
									payload
								);

								expect(cnt).toEqual(1);
								expect(listener).toHaveBeenCalled();
								expect(listener).toHaveBeenCalledWith(
									type,
									payload
								);

								hubA.removeEventListener(handle);
							}
						);

						it(
							'causes listener to be called with expected type & string payload when event is dispatched',
							() => {
								const listener = jest.fn();
								const payload = 'aPayload';
								const type = 'anEvent';

								const handle = hubA.addEventListener(
									type,
									listener
								);

								const cnt = hubA.dispatchClientEvent(
									type,
									payload
								);

								expect(cnt).toEqual(1);
								expect(listener).toBeCalledWith(
									type,
									payload
								);

								hubA.removeEventListener(handle);
							}
						);

						it(
							'when type does not match, no event is fired',
							() => {
								const listener = jest.fn();
								const payload = 'aPayload';
								const type = 'anEvent';

								const handle = hubB.addEventListener(
									'differentEvent',
									listener
								);

								const cnt = hubA.dispatchClientEvent(
									type,
									payload
								);

								expect(cnt).toEqual(0);
								expect(listener).not.toHaveBeenCalled();
							}
						);

						it(
							'payload=null is transported correctly',
							() => {
								const listener = jest.fn();
								const payload = null;
								const type = 'anEvent';

								const handle = hubA.addEventListener(
									type,
									listener
								);

								const cnt = hubA.dispatchClientEvent(
									type,
									payload
								);

								expect(cnt).toEqual(1);
								expect(listener).toHaveBeenCalledWith(
									type,
									payload
								);

								hubA.removeEventListener(handle);
							}
						);

						it(
							'payload of type object is transported correctly',
							() => {
								const listener = jest.fn();

								const payload = {
									addr: 'Stgt',
									name: 'Scott'
								};
								const type = 'anEvent';

								const handle = hubA.addEventListener(
									type,
									listener
								);

								const cnt = hubA.dispatchClientEvent(
									type,
									payload
								);

								expect(cnt).toEqual(1);
								expect(listener).toHaveBeenCalledWith(
									type,
									payload
								);

								hubA.removeEventListener(handle);
							}
						);

						it(
							'listener of different portlet is correctly called when event is dispatched',
							() => {
								const listener = jest.fn();
								const payload = 'aPayload';
								const type = 'anEvent';

								const handle = hubB.addEventListener(
									type,
									listener
								);

								const cnt = hubA.dispatchClientEvent(
									type,
									payload
								);

								expect(cnt).toEqual(1);
								expect(listener).toHaveBeenCalledWith(
									type,
									payload
								);

								hubB.removeEventListener(handle);
							}
						);

						it(
							'matches event types by regex',
							() => {
								const listener = jest.fn();
								const payload = 'aPayload';
								const type = 'ibm.anEvent';

								const handle = hubB.addEventListener(
									'ibm\..*',
									listener
								);

								const cnt = hubA.dispatchClientEvent(
									type,
									payload
								);

								expect(cnt).toEqual(1);
								expect(listener).toHaveBeenCalledWith(
									type,
									payload
								);
							}
						);

						it(
							'when regex does not match, no event is fired',
							() => {
								const listener = jest.fn();
								const payload = 'aPayload';
								const type = 'anEvent';

								const handle = hubB.addEventListener(
									'ibm\..*',
									listener
								);

								const cnt = hubA.dispatchClientEvent(
									type,
									payload
								);

								expect(cnt).toEqual(0);
								expect(listener).not.toHaveBeenCalled();
							}
						);

						it(
							'2 listeners of different portlet are correctly called when event is dispatched',
							() => {
								const listenerB = jest.fn();
								const listenerD = jest.fn();
								const payload = 'aPayload';
								const type = 'anEvent';

								const handleB = hubB.addEventListener(
									type,
									listenerB
								);
								const handleD = hubD.addEventListener(
									type,
									listenerD
								);

								const cnt = hubA.dispatchClientEvent(
									type,
									payload
								);

								expect(cnt).toEqual(2);
								expect(listenerB).toHaveBeenCalledWith(
									type,
									payload
								);

								expect(listenerD).toHaveBeenCalledWith(
									type,
									payload
								);

								hubB.removeEventListener(handleB);
								hubD.removeEventListener(handleD);
							}
						);
					}
				);
			}
		);

		describe(
			'the portlet hub createResourceUrl function',
			() => {
				const ids = portlet.test.getIds();
				const portletA = ids[0];
				const portletB = ids[1];

				const onStateChange = jest.fn();
				const pageState = portlet.test.getInitData();
				let hubA;
				let hubB;
				let listenerA;

				beforeEach(
					() => {
						return Promise.all(
							[
								register(portletA),
								register(portletB)
							]
						)
							.then(
								values => {
									hubA = values[0];
									listenerA = hubA.addEventListener(
										'portlet.onStateChange',
										onStateChange
									);

									hubB = values[1];
								}
							);
					}
				);

				afterEach(
					() => {
						hubA.removeEventListener(listenerA);
						hubA = null;
						hubB = null;
					}
				);

				it(
					'is present in the register return object and is a function',
					() => {
						expect(typeof hubA.createResourceUrl).toEqual('function');
					}
				);

				it(
					'throws a TypeError if too many (>3) arguments are provided',
					() => {
						const testFunc = () => {
							hubA.createResourceUrl(
								null,
								'parm1',
								'parm2',
								'parm3'
							);
						};

						expect(testFunc).toThrow('Too many arguments. 3 arguments are allowed.');
					}
				);

				it(
					'throws a TypeError if resource parameters is invalid',
					() => {
						const parms = {rp1: 'resVal'};
						const testFunc = () => {
							hubA.createResourceUrl(
								parms,
								'cacheLevelPortlet'
							);
						};

						expect(testFunc).toThrow(TypeError);
					}
				);

				it(
					'throws a TypeError if the cacheability argument is invalid',
					() => {
						const parms = {rp1: ['resVal']};
						const testFunc = () => {
							hubA.createResourceUrl(
								parms,
								'Invalid'
							);
						};

						expect(testFunc).toThrow(TypeError);
					}
				);

				it(
					'throws a TypeError if there are 2 cacheability arguments',
					() => {
						const parms = {rp1: ['resVal']};
						const testFunc = () => {
							hubA.createResourceUrl(
								'cacheLevelPage',
								'cacheLevelFull'
							);
						};

						expect(testFunc).toThrow(TypeError);
					}
				);

				it(
					'throws a TypeError if there are 2 res params arguments',
					() => {
						const parms = {rp1: ['resVal']};
						const testFunc = () => {
							return hubA.createResourceUrl(
								parms,
								parms
							);
						};

						expect(testFunc).toThrow(TypeError);
					}
				);

				it(
					'does not throw if both arguments are valid',
					() => {
						const parms = {rp1: ['resVal']};
						const testFunc = () => {
							hubA.createResourceUrl(
								parms,
								'cacheLevelPage'
							);
						};

						expect(testFunc).not.toThrow();
					}
				);

				it(
					'returns a string if both arguments are valid',
					() => {
						const parms = {rp1: ['resVal']};

						return hubA.createResourceUrl(
							parms,
							'cacheLevelFull'
						)
							.then(
								url => {
									expect(typeof url).toEqual('string');
								}
							);
					}
				);

				it(
					'Throws an exception if cacheability is specified first',
					() => {
						const parms = {rp1: ['resVal']};
						const testFunc = () => {
							return hubA.createResourceUrl(
								'cacheLevelPage',
								parms
							);
						};

						expect(testFunc).toThrow(TypeError);
					}
				);

				it(
					'returns a string if only cacheability present',
					() => {
						const parms = {rp1: ['resVal']};

						return hubA.createResourceUrl(
							null,
							'cacheLevelPortlet'
						)
							.then(
								url => {
									expect(typeof url).toEqual('string');
								}
							);
					}
				);

				it(
					'returns a string if only resource parameters present',
					() => {
						const parms = {
							rp1: ['resVal'],
							rp2: ['resVal2']
						};

						return hubA.createResourceUrl(
							parms
						)
							.then(
								url => {
									expect(typeof url).toEqual('string');
								}
							);
					}
				);

				it(
					'returns a string if no parameters present',
					() => {
						const parms = {
							rp1: ['resVal'],
							rp2: ['resVal2']
						};

						return hubA.createResourceUrl()
							.then(
								url => {
									expect(typeof url).toEqual('string');
								}
							);
					}
				);

				it(
					'returns a URL indicating the initiating portlet A',
					() => {
						const parms = {
							rp1: ['resVal'],
							rp2: ['resVal2']
						};

						return hubA.createResourceUrl(
							parms,
							'cacheLevelPage'
						)
							.then(
								url => {
									expect(typeof url).toEqual('string');

									// TODO: This should return "PortletA" not null
									// console.log(portlet.test.action.getInitiatingPortletId(url));

								}
							);
					}
				);

				// TODO: implement same as above, but for portletB
				// @see: https://github.com/apache/portals-pluto/blob/master/portlet-api/src/test/javascript/CreateResourceUrlTest.js#L293

				// TODO: fix implementation and test

				it(
					'returns a resource URL',
					() => {
						const cache = 'cacheLevelPage';
						const parms = {
							rp1: ['resVal'],
							rp2: ['resVal2']
						};

						return hubB.createResourceUrl(
							parms,
							cache
						)
							.then(
								url => {
									expect(portlet.test.resource.isResourceUrl(url)).toBeTruthy();
								}
							);
					}
				);

				it(
					'returns a URL with cacheability set to "cacheLevelPage"',
					() => {
						const cache = 'cacheLevelPage';
						const parms = {
							rp1: ['resVal'],
							rp2: ['resVal2']
						};

						let str;
						let url;

						return hubB.createResourceUrl(
							parms,
							cache
						)
							.then(
								url => {
									const str = portlet.test.resource.getCacheability(url);
									expect(str).toEqual(cache);
								}
							);
					}
				);
			}
		);

		describe(
			'allows the portlet client test for a blocking operation',
			() => {
				const ids = portlet.test.getIds();
				const portletA = ids[0];
				const portletB = ids[1];
				const portletC = ids[2];
				const portletD = ids[3];

				// Tests in this module need following portlets. register them.
				// These variables provide linkage between the "describe" sections

				const pageState = portlet.test.getInitData();

				const listenerA = jest.fn();
				const listenerB = jest.fn();
				const listenerC = jest.fn();
				const listenerD = jest.fn();

				let handleA;
				let handleB;
				let handleC;
				let handleD;
				let hubA;
				let hubB;
				let hubC;
				let hubD;

				beforeEach(
					() => {
						return Promise.all(
							[
								register(portletA),
								register(portletB),
								register(portletC),
								register(portletD)
							]
						)
							.then(
								values => {
									hubA = values[0];
									handleA = hubA.addEventListener(
										'portlet.onStateChange',
										listenerA
									);

									hubB = values[1];
									handleB = hubB.addEventListener(
										'portlet.onStateChange',
										listenerB
									);

									hubC = values[2];
									handleC = hubC.addEventListener(
										'portlet.onStateChange',
										listenerC
									);

									hubD = values[3];
									handleD = hubD.addEventListener(
										'portlet.onStateChange',
										listenerD
									);
								}
							);
					}
				);

				afterEach(
					() => {
						listenerA.mockReset();
						hubA.removeEventListener(handleA);

						listenerB.mockReset();
						hubB.removeEventListener(handleB);

						listenerC.mockReset();
						hubC.removeEventListener(handleC);

						listenerD.mockReset();
						hubD.removeEventListener(handleD);
					}
				);

				it(
					'initializes a portlet hub instance for portlet A',
					() => {
						expect(hubA).not.toBeUndefined();
					}
				);

				it(
					'initializes a portlet hub instance for portlet B',
					() => {
						expect(hubB).not.toBeUndefined();
					}
				);

				it(
					'initializes a portlet hub instance for portlet C',
					() => {
						expect(hubC).not.toBeUndefined();
					}
				);

				it(
					'initializes a portlet hub instance for portlet D',
					() => {
						expect(hubD).not.toBeUndefined();
					}
				);

				it(
					'is present in the register return object and is a function',
					() => {
						expect(typeof hubA.isInProgress).toEqual('function');
					}
				);

				it(
					'returns a boolean value',
					() => {
						const retval = hubA.isInProgress();
						expect(typeof retval).toEqual('boolean');
					}
				);

				it(
					'returns false if a blocking operation is not in progress',
					() => {
						const retval = hubA.isInProgress();
						expect(retval).toBe(false);
					}
				);

				it(
					'returns false through a different hub if a blocking operation is not in progress',
					() => {
						const retval = hubD.isInProgress();
						expect(retval).toBe(false);
					}
				);

				it(
					'returns true when a partial action has been started but setPageState has not been called',
					done => {
						const parms = {ap1: ['actionVal']};

						return hubB.startPartialAction(parms)
							.then(
								pageObject => {
									expect(hubB.isInProgress()).toBeTruthy();

									pageObject.setPageState(
										JSON.stringify({})
									);

									setTimeout(
										() => {
											expect(listenerB).toHaveBeenCalled();
											done();
										}
									);
								}
							);
					}
				);

				it(
					'returns true through a different hub when a partial action has been started but setPageState has not been called',
					done => {
						const parms = {ap1: ['actionVal']};

						return hubB.startPartialAction(parms)
							.then(
								pageObject => {
									expect(hubB.isInProgress()).toBeTruthy();
									expect(hubD.isInProgress()).toBeTruthy();

									pageObject.setPageState(JSON.stringify({}));

									setTimeout(
										() => {
											expect(listenerB).toHaveBeenCalled();
											done();
										}
									);
								}
							);
					}
				);

				it(
					'returns true when setPageState has been called but the updates have not been dispatched',
					done => {
						const parms = {ap1: ['actionVal']};

						hubB.startPartialAction(parms)
							.then(
								pageObject => {
									pageObject.setPageState(JSON.stringify({}));
									expect(hubB.isInProgress()).toBeTruthy();

									setTimeout(
										() => {
											expect(listenerB).toHaveBeenCalled();
											done();
										}
									);
								}
							);
					}
				);

				it(
					'returns false after setPageState updates have been dispatched',
					done => {
						const parms = {ap1: ['actionVal']};

						return hubB.startPartialAction(parms)
							.then(
								pageObject => {
									pageObject.setPageState(JSON.stringify({}));
									expect(hubD.isInProgress()).toBeTruthy();

									setTimeout(
										() => {
											expect(listenerD).toHaveBeenCalled();
											expect(hubD.isInProgress()).toBeFalsy();
											done();
										}
									);
								}
							);
					}
				);

				it(
					'returns false through a different hub after setPageState updates have been dispatched',
					done => {
						const parms = {ap1: ['actionVal']};

						hubB.startPartialAction(parms)
							.then(
								pageObject => {
									pageObject.setPageState(JSON.stringify({}));

									expect(hubB.isInProgress()).toBeTruthy();

									setTimeout(
										() => {
											expect(listenerC).toHaveBeenCalled();
											expect(hubB.isInProgress()).toBeFalsy();
											done();
										}
									);
								}
							);
					}
				);

				it(
					'returns true when action has been called but the updates have not been dispatched',
					done => {
						fetchMock(
							[
								portletA,
								portletB,
								portletC,
								portletD
							]
						);

						const el = document.createElement('form');
						const parms = {ap1: ['actionVal']};
						const testFunc = () => hubB.action(parms, el);

						expect(testFunc).not.toThrow();
						expect(hubD.isInProgress()).toBeTruthy();

						global.fetch.mockRestore();

						setTimeout(
							() => {
								done();
							}
						);
					}
				);

				it(
					'returns true through a different hub when action has been called but the updates have not been dispatched',
					done => {
						fetchMock(
							[
								portletA,
								portletB,
								portletC,
								portletD
							]
						);

						const el = document.createElement('form');
						const parms = {ap1: ['actionVal']};
						const testFunc = () => hubB.action(parms, el);

						expect(testFunc).not.toThrow();
						expect(hubD.isInProgress()).toBeTruthy();

						global.fetch.mockRestore();

						setTimeout(
							() => {
								expect(listenerB).toHaveBeenCalled();
								done();
							}
						);
					}
				);

				it(
					'returns false after action updates have been dispatched',
					done => {
						fetchMock(
							[
								portletA,
								portletB,
								portletC,
								portletD
							]
						);

						const el = document.createElement('form');
						const parms = {ap1: ['actionVal']};
						const testFunc = () => hubB.action(parms, el);

						expect(testFunc).not.toThrow();

						global.fetch.mockRestore();

						setTimeout(
							() => {
								expect(listenerB).toHaveBeenCalled();
								expect(hubC.isInProgress()).toBeFalsy();

								done();
							}
						);
					}
				);

				it(
					'returns true when setRenderState has been called but the updates have not been dispatched',
					done => {
						const parms = {ap1: ['actionVal']};
						const state = pageState.portlets.PortletC.state;

						state.parameters.someparm1 = ['NewVal'];

						const testFunc = () => hubC.setRenderState(state);

						expect(testFunc).not.toThrow();
						expect(hubD.isInProgress()).toBeTruthy();

						setTimeout(
							() => {
								expect(listenerC).toHaveBeenCalled();
								done();
							}
						);
					}
				);

				it(
					'returns true through a different hub when setRenderState has been called but the updates have not been dispatched',
					done => {
						const parms = {ap1: ['actionVal']};
						const state = pageState.portlets.PortletC.state;

						state.parameters.someparm1 = ['NewVal'];

						const testFunc = () => hubC.setRenderState(state);

						expect(testFunc).not.toThrow();
						expect(hubD.isInProgress()).toBeTruthy();

						setTimeout(
							() => {
								expect(listenerC).toHaveBeenCalled();
								done();
							}
						);
					}
				);

				it(
					'returns false after setRenderState updates have been dispatched',
					done => {
						const parms = {ap1: ['actionVal']};
						const state = pageState.portlets.PortletC.state;

						state.parameters.someparm1 = ['NewVal'];

						const testFunc = () => hubC.setRenderState(state);

						expect(testFunc).not.toThrow();

						setTimeout(
							() => {
								expect(listenerC).toHaveBeenCalled();

								expect(hubA.isInProgress()).toBeFalsy();
								expect(hubB.isInProgress()).toBeFalsy();
								expect(hubC.isInProgress()).toBeFalsy();
								expect(hubD.isInProgress()).toBeFalsy();
								done();
							}
						);
					}
				);
			}
		);
	}
);