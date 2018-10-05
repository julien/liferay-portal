'use strict';

import isEqual from '../../../src/main/resources/META-INF/resources/liferay/util/is_equal.es';

describe(
	'Liferay.Util.isEqual',
	()	=>	{

		it(
			'should return true if two primitive values are equal',
			()	=>	{
				expect(isEqual('hello', 'hello')).toBeTruthy();
				expect(isEqual(1, 1)).toBeTruthy();
				expect(isEqual(20.3, 20.3)).toBeTruthy();
				expect(isEqual(Math.PI, Math.PI)).toBeTruthy();
				expect(isEqual(undefined, undefined)).toBeTruthy();
				expect(isEqual(null, null)).toBeTruthy();
			}
		);

		it(
			'should return false if two primitive values aren\'t equal',
			()	=>	{
				expect(isEqual('hello', 'goodbye')).toBeFalsy();
				expect(isEqual(1, 2)).toBeFalsy();
				expect(isEqual(20.3, 20.31)).toBeFalsy();
				expect(isEqual(Math.PI, Math.SQRT2)).toBeFalsy();
				expect(isEqual(undefined, null)).toBeFalsy();
				expect(isEqual(null, 0)).toBeFalsy();
			}
		);

		it(
			'should return true if two objects are equal',
			()	=>	{
				const a = {name: 'liferay'};
				const b = {name: 'liferay'};

				expect(isEqual(a, b)).toBeTruthy();

				const c = Object.assign({}, b);

				expect(isEqual(c, b)).toBeTruthy();
				expect(isEqual(c, a)).toBeTruthy();
			}
		);

		it(
			'should return false if two objects aren\'t equal',
			()	=>	{
				const a = {
					name: 'liferay'
				};

				const b = {
					age: 30,
					name: 'foo'
				};

				expect(isEqual(a, b)).toBeFalsy();

				const c = Object.assign(
					{
						age: 20,
						foo: 'bar',
						name: 'other'
					},
					b
				);

				expect(isEqual(c, b)).toBeFalsy();
				expect(isEqual(c, a)).toBeFalsy();
			}
		);

		it(
			'should return true if two arrays are equal',
			()	=>	{
				const a = [1, 2, 3];
				const b = a.slice(0);

				expect(isEqual(a, b)).toBeTruthy();

				const c = a.map(e => e);

				expect(isEqual(c, b)).toBeTruthy();
				expect(isEqual(c, a)).toBeTruthy();
			}
		);

		it(
			'should return false if two arrays aren\'t equal',
			()	=>	{
				const a = [1, 2, 3];
				const b = [4, 5, 6];

				expect(isEqual(a, b)).toBeFalsy();

				const c = a.map(e => e * 2);

				expect(isEqual(c, b)).toBeFalsy();
				expect(isEqual(c, a)).toBeFalsy();
			}
		);

	}
);