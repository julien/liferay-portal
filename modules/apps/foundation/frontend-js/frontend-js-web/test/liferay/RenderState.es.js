'use strict';

import RenderState from '../../src/main/resources/META-INF/resources/liferay/portlet_hub/RenderState.es';
import PortletConstants from '../../src/main/resources/META-INF/resources/liferay/portlet_hub/PortletConstants.es';

describe(
	'Render State',
	() => {
		describe(
			'constructor',
			() => {
				it(
					'should create a RenderState object according to the data passed to the constructor',
					() => {
						const mockData = {
							parameters: {
								a: [null],
								b: [1, 2, 3],
								c: null,
								d: 2
							},
							portletMode: 'edit',
							windowState: 'maximized'
						};

						const rs = new RenderState(mockData);

						expect(rs.parameters.a).toBeDefined();
						expect(rs.parameters.a).toEqual(expect.arrayContaining([null]));
						expect(rs.parameters.b).toBeDefined();
						expect(rs.parameters.b).toEqual(expect.arrayContaining([1, 2, 3]));
						expect(rs.parameters.c).not.toBeDefined();
						expect(rs.parameters.d).not.toBeDefined();
						expect(rs.portletMode).toEqual(PortletConstants.EDIT);
					}
				);
			}
		);

		describe(
			'clone',
			() => {
				it(
					'should return a new RenderState instance with the same properties',
					() => {
						const rs1 = new RenderState(
							{
								parameters:
								{
									a: [1, 2, 3],
									b: 'foo',
									c: ['bar', null]
								},
								portletMode: 'VIEW',
								windowState: 'NORMAL'
							}
						);

						const rs2 = rs1.clone();

						expect(rs2.parameters.a).toEqual(expect.arrayContaining(rs1.parameters.a));

						expect(rs1.parameters.b).not.toBeDefined();
						expect(rs2.parameters.b).toEqual(rs1.parameters.b);

						expect(rs1.parameters.c).toEqual(expect.arrayContaining(['bar', null]));
						expect(rs2.parameters.c).toEqual(expect.arrayContaining(rs1.parameters.c));

						expect(rs1.portletMode).toEqual(PortletConstants.VIEW);
						expect(rs2.portletMode).toEqual(rs1.portletMode);

						expect(rs1.windowState).toEqual(PortletConstants.NORMAL);
						expect(rs2.windowState).toEqual(rs1.windowState);
					}
				);
			}
		);

		describe(
			'getValue',
			() => {

				it(
					'should throw an error if specified parameter is not a string',
					() => {
						const rs = new RenderState(
							{
								parameters: {
									a: [1, 2, 3]
								},
								portletMode: 'edit',
								windowState: 'normal'
							}
						);

						const fn = () => {
							rs.getValue(1);
						};

						expect(fn).toThrow();
					}
				);

				it(
					'should return a value if specified parameter is undefined and default value is specified',
					() => {
						const rs = new RenderState();

						const def = [1, 2, 3];

						const res = rs.getValue('a', def);

						expect(res).toEqual(expect.arrayContaining(def));
					}
				);

				it(
					'should return a parameter value if it is defined',
					() => {
						const rs = new RenderState(
							{
								parameters: {
									a: ['foo']
								},
								portletMode: 'edit',
								windowState: 'normal'
							}
						);

						expect(rs.getValue('a')).toEqual('foo');
					}
				);
			}
		);

		describe(
			'getValues',
			() => {

				it(
					'should throw an error if the specified parameter is not a string',
					() => {
						const rs = new RenderState();

						const fn = () => {
							rs.getValues(1);
						};

						expect(fn).toThrow();
					}
				);

				it(
					'should return a value if the specified parameter is undefined and a default value is provided',
					() => {
						const rs = new RenderState();

						expect(rs.getValues('foo', 'bar')).toEqual('bar');
					}
				);

				it(
					'should return a parameter\'s value if it is defined',
					() => {
						const rs = new RenderState(
							{
								parameters: {
									data: ['something', 'here']
								},
								portletMode: 'edit',
								windowState: 'normal'
							}
						);

						expect(rs.getValues('data')).toEqual(expect.arrayContaining(['something', 'here']));
					}
				);
			}
		);

		describe(
			'remove',
			() => {

				it(
					'should throw an error if the speficied parameter is not a string',
					() => {
						const rs = new RenderState();

						const fn = () => {
							rs.remove(1);
						};

						expect(fn).toThrow();
					}
				);

				it(
					'should not remove a existing parameter',
					() => {
						const rs = new RenderState(
							{
								parameters: {
									data: [1, 2, 3]
								},
								portletMode: 'edit',
								windowState: 'normal'
							}
						);

						expect(rs.getValues('data')).toEqual(expect.arrayContaining([1, 2, 3]));

						rs.remove('data');

						expect(rs.parameters.data).not.toBeDefined();
					}
				);
			}
		);

		describe(
			'setValue',
			() => {

				it(
					'should throw an error if `name` is not a string',
					() => {
						const rs = new RenderState();

						const fn = () => {
							rs.setValue(1);
						};

						expect(fn).toThrow();
					}
				);

				it(
					'should throw an error if `value` is not a string',
					() => {
						const rs = new RenderState();

						const fn = () => {
							rs.setValue('a', 1);
						};

						expect(fn).toThrow();
					}
				);

				it(
					'should throw an error if `value` is not a array',
					() => {
						const rs = new RenderState();

						const fn = () => {
							rs.setValue(
								'a',
								{
									foo: 'bar'
								}
							);
						};

						expect(fn).toThrow();
					}
				);

				it(
					'should throw an error if `value` is not null',
					() => {
						const rs = new RenderState();

						const fn = () => {
							rs.setValue('a', undefined);
						};

						expect(fn).toThrow();
					}
				);

				it(
					'should set a parameter if `value` is a string',
					() => {
						const rs = new RenderState();

						rs.setValue('a', 'foo');

						expect(rs.getValue('a')).toEqual('foo');
					}
				);

				it(
					'should set a parameter if `value` is null',
					() => {
						const rs = new RenderState();

						rs.setValue('b', null);

						expect(rs.getValue('b')).toEqual(null);
					}
				);

				it(
					'should set a parameter if `value` is an array',
					() => {
						const rs = new RenderState();

						rs.setValue('c', [4, 5, 6]);

						expect(rs.getValue('c')).toEqual(4);
						expect(rs.getValues('c')).toEqual(expect.arrayContaining([4, 5, 6]));
					}
				);
			}
		);

		describe(
			'setValues',
			() => {

				it(
					'should throw an error if `value` is not a string',
					() => {
						const rs = new RenderState();

						const fn = () => {
							rs.setValues('a', 1);
						};

						expect(fn).toThrow();
					}
				);

				it(
					'should throw an error if `value` is not null',
					() => {
						const rs = new RenderState();

						const fn = () => {
							rs.setValues('b', undefined);
						};

						expect(fn).toThrow();
					}
				);

				it(
					'should throw an error if `value` is not an array',
					() => {
						const rs = new RenderState();

						const fn = () => {
							rs.setValues(
								'c',
								{
									foo: 'bar'
								}
							);
						};

						expect(fn).toThrow();
					}
				);

				it(
					'should set a parameter value if `value` is a string',
					() => {
						const rs = new RenderState();

						rs.setValues('data', 'hello');

						expect(rs.getValues('data')).toEqual(expect.arrayContaining(['hello']));
						expect(rs.getValue('data')).toEqual('hello');
					}
				);

				it(
					'should set a parameter value if `value` is null',
					() => {
						const rs = new RenderState();
						rs.setValues('data', null);

						expect(rs.getValues('data')).toEqual(expect.arrayContaining([null]));
						expect(rs.getValue('data')).toEqual(null);
					}
				);

				it(
					'should set a parameter value if `value` is an array',
					() => {
						const rs = new RenderState();
						rs.setValues('url', ['one', 'two', 'three']);

						expect(rs.getValues('url')).toEqual(expect.arrayContaining(['one', 'two', 'three']));
						expect(rs.getValue('url')).toEqual('one');
					}
				);
			}
		);
	}
);