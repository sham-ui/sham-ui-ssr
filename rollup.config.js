import path from 'path';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';

const main = path.dirname( pkg.main );
const module = path.dirname( pkg.module );

export default [ {
    input: './src/index.js',
    output: [
        { file: pkg.main, format: 'cjs', exports: 'auto' },
        { file: pkg.module, format: 'es' }
    ]
}, {
    input: './src/hydrator/index.js',
    external: [
        /@babel\/runtime/,
        /@corejs/
    ],
    output: [
        { file: path.join( main, 'hydrator.js' ), format: 'cjs', exports: 'auto' },
        { file: path.join( module, 'hydrator.js' ), format: 'es' }
    ],
    plugins: [
        babel( {
            extensions: [ '.js' ],
            exclude: [ 'node_modules/**' ],
            babelHelpers: 'inline'
        } ),
        nodeResolve( {
            browser: false
        } ),
        commonjs()
    ]
}, {
    input: './src/rehydrator/index.js',
    external: [
        /@babel\/runtime/,
        /@corejs/
    ],
    output: [
        { file: path.join( main, 'rehydrator.js' ), format: 'cjs', exports: 'auto' },
        { file: path.join( module, 'rehydrator.js' ), format: 'es' }
    ],
    plugins: [
        babel( {
            extensions: [ '.js' ],
            exclude: [ 'node_modules/**' ],
            babelHelpers: 'inline'
        } ),
        nodeResolve( {
            browser: true
        } ),
        commonjs()
    ]
}, {
    input: './src/testing/index.js',
    external: [
        'sham-ui',
        'pretty',
        /@babel\/runtime/,
        /@corejs/
    ],
    output: [
        { file: path.join( main, 'testing.js' ), format: 'cjs', exports: 'auto' },
        { file: path.join( module, 'testing.js' ), format: 'es' }
    ],
    plugins: [
        babel( {
            extensions: [ '.js' ],
            exclude: [ 'node_modules/**' ],
            babelHelpers: 'inline'
        } ),
        nodeResolve( {
            browser: true
        } ),
        commonjs()
    ]
} ];
