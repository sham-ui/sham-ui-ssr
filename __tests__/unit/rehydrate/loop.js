import { compile } from 'sham-ui-test-helpers';
import { ssrAndRehydrate } from '../../../src/testing';

beforeEach( () => {
    window.MyLi = compile`
        <li>{{ props.id + ':' + props.value }}</li>
    `;
    window.MyUl = compile`
        <ul>
            {% for element of list %}
                <MyLi props="{{ element }}"/>
            {% endfor %}
        </ul>
    `;
} );

afterEach( () => {
    delete window.MyLi;
    delete window.MyUl;
} );


it( 'should render arrays', async() => {
    expect.assertions( 4 );
    const meta = await ssrAndRehydrate(
        compile`
            <ul>
                {% for key, value of list %}
                    <li>{{ key }}:{{ value }}</li>
                {% endfor %}
            </ul>
        `,
        {
            list: [ 1, 2, 3 ]
        }
    );
    expect( meta.html ).toBe(
        // eslint-disable-next-line max-len
        '<ul><li>0<!--0-->:<!--1-->1</li><li>1<!--0-->:<!--1-->2</li><li>2<!--0-->:<!--1-->3</li></ul>'
    );

    meta.component.update( { list: [ 1, 3 ] } );
    expect( meta.ctx.container.innerHTML ).toBe(
        '<ul><li>0<!--0-->:<!--1-->1</li><li>1<!--0-->:<!--1-->3</li></ul>'
    );

    meta.component.update( { list: [ 'a', 'b', 'c', 'd' ] } );
    expect( meta.ctx.container.innerHTML ).toBe(
        '<ul><li>0<!--0-->:<!--1-->a</li><li>1<!--0-->:<!--1-->b</li><li>2:c</li><li>3:d</li></ul>'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should render arrays with externals', async() =>{
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`
            <div>
                {% for value of list %}
                    <p>{{ value }}{{ ext }}</p>
                {% endfor %}
            </div>
        `,
        {
            list: [ 1, 2, 3 ],
            ext: '.js'
        }
    );
    expect( meta.html ).toBe(
        '<div><p>1<!--0-->.js</p><p>2<!--0-->.js</p><p>3<!--0-->.js</p></div>'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should iterate over objects', async() => {
    expect.assertions( 3 );
    const meta = await ssrAndRehydrate(
        compile`
            <div>
                {% for key, value of obj %}
                    {{ key }}: {{ value }};
                {% endfor %}
            </div>
        `,
        {
            obj: {
                a: 1,
                b: 2,
                c: 3
            }
        }
    );
    expect( meta.html ).toBe(
        // eslint-disable-next-line max-len
        '<div>a<!--0-->: <!--1-->1<!--2-->; <!--3-->b<!--4-->: <!--5-->2<!--6-->; <!--7-->c<!--8-->: <!--9-->3<!--10-->; </div>'
    );

    meta.component.update( {
        obj: {
            a: 1,
            c: 3,
            d: 4
        }
    } );
    expect( meta.ctx.container.innerHTML ).toBe(
        // eslint-disable-next-line max-len
        '<div>a<!--0-->: <!--1-->1<!--2-->; <!--3-->c<!--4-->: <!--5-->3<!--6-->; <!--7-->d<!--8-->: <!--9-->4<!--10-->; </div>'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should iterate over arrays without options', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`
            <div>
                {% for obj %}
                    {{ name }};
                {% endfor %}
            </div>
        `,
        {
            obj: [
                { name: 'a' },
                { name: 'b' },
                { name: 'c' }
            ]
        }
    );
    expect( meta.html ).toBe( '<div>a<!--0-->; <!--1-->b<!--2-->; <!--3-->c<!--4-->; </div>' );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should delete old items from childred map with custom tag', async() => {
    expect.assertions( 3 );
    const meta = await ssrAndRehydrate(
        compile`
            <div>
                <MyUl list="{{ list }}"/>
            </div>
        `,
        {
            list: [
                {
                    id: 1,
                    value: 'a'
                },
                {
                    id: 2,
                    value: 'b'
                },
                {
                    id: 3,
                    value: 'c'
                }
            ]
        }
    );
    expect( meta.html ).toBe(
        '<div><ul><li>1:a</li><!--0--><li>2:b</li><!--0--><li>3:c</li><!--0--></ul></div>'
    );

    meta.component.update( {
        list: [
            {
                id: 1,
                value: 'a'
            },
            {
                id: 3,
                value: 'c'
            }
        ]
    } );
    expect( meta.ctx.container.innerHTML ).toBe(
        '<div><ul><li>1:a</li><!--0--><li>3:c</li><!--0--></ul></div>'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );

it( 'should not expose local variables', async() => {
    expect.assertions( 2 );
    const meta = await ssrAndRehydrate(
        compile`
            <section>
                {% for a of as %}
                    <i>
                        {% for b of bs %}
                            <b>{{ b }}</b>
                        {% endfor %}
                    </i>
                {% endfor %}
            </section>
        `,
        {
            as: [ 'a', 'b' ],
            bs: [ 1, 2 ],
            b: 'GLOBAL'
        }
    );
    expect( meta.html ).toBe(
        '<section><i><b>1</b><b>2</b></i><i><b>1</b><b>2</b></i></section>'
    );
    expect( meta.toJSON() ).toMatchSnapshot();
} );
