// /*
//  * @Author: Devin Lin (devin.lin@ringcentral.com)
//  * @Date: 2018-03-02 13:20:02
//  * @Last Modified by: Devin Lin (devin.lin@ringcentral.com)
//  * @Last Modified time: 2018-03-02 13:34:04
//  */

import mock from './mock';

// const data = { users: [ { id: '123', name: 'Beth' } ] };

const getPosts = () => Promise.resolve(mock);

export { getPosts };

// // const post = new schema.Entity('posts');

// // const data = [ { id: '123', name: 'Jim' }, { id: '456', name: 'Jane' } ];
// const { posts } = mock;

// const postSchema = new schema.Entity('posts', {}, { idAttribute: '_id' });
// const postListSchema = new schema.Array(postSchema); // const postListSchema = [ postSchema ];

// const normalizedData = normalize(posts, postListSchema);

// // const normalizedData = normalize(mock.posts);

// const data = [{ id: 1, type: 'admin' }, { id: 2, type: 'user' }];

// const userSchema = new schema.Entity('users');
// const adminSchema = new schema.Entity('admins');
// const myArray = new schema.Array(
//   {
//     admins: adminSchema,
//     users: userSchema,
//   },
//   (input, parent, key) => {
//     console.log(`input: ${JSON.stringify(input)}`);
//     console.log(`parent: ${JSON.stringify(parent)}`);
//     console.log(`key: ${JSON.stringify(key)}`);
//     return `${input.type}s`;
//   }
// );

// const normalizedData = normalize(data, myArray);

// export default normalizedData;
