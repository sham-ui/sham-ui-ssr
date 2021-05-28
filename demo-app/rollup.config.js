import path from 'path';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import cleaner from 'rollup-plugin-cleaner';
import scss from 'rollup-plugin-scss';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import nodeResolveWithMacro from 'rollup-plugin-node-resolve-with-sham-ui-macro';
import shamUICompiler from 'rollup-plugin-sham-ui-templates';
import { babel } from '@rollup/plugin-babel';


//const { config } = findBabelConfig.sync( process.cwd() );

export default {
    input: path.join( __dirname, 'src/main.js' ),
    output: {
        file: path.join( __dirname, 'dist/bundle.js' ),
        format: 'iife',
        sourcemap: true
    },
    plugins: [
        cleaner( {
            targets: [
                path.join( __dirname, 'dist' )
            ]
        } ),
        replace( {
            preventAssignment: true,
            'process.env.NODE_ENV': JSON.stringify( process.env.NODE_ENV )
        } ),
        shamUICompiler( {
            extensions: [ '.sht' ],
            compilerOptions: {
                removeDataTest: false
            }
        } ),
        shamUICompiler( {
            extensions: [ '.sfc' ],
            compilerOptions: {
                asModule: false,
                asSingleFileComponent: true,
                removeDataTest: false
            }
        } ),
        nodeResolveWithMacro( {
            browser: true
        } ),
        babel( {
            extensions: [ '.js', '.sht', '.sfc' ],
            exclude: [ 'node_modules/**' ],
            babelHelpers: 'bundled'
        } ),
        commonjs(),
        scss( {
            failOnError: true,
            output: path.join( __dirname, 'dist/bundle.css' ),
            watch: path.join( __dirname, 'src/styles' ),
            sass: require( 'sass' )
        } ),
        serve( {
            port: 3000,
            contentBase: __dirname
        } ),
        livereload( {
            watch: path.join( __dirname, 'dist' )
        } )
    ]
};


