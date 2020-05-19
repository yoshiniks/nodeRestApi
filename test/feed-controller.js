const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');
const io = require('../socket');

const User = require('../models/user');
const Post = require('../models/post');
const FeedController = require('../controllers/feed');
const key = require('../key');

describe('Feed controller', function() {
    before(function(done) {
        mongoose.connect(key.MONGODB_URI_TEST)
            .then(result => {
                const user = new User ({
                    email: 'test@test.com',
                    password: 'tester',
                    name: 'Test',
                    posts: [],
                    _id: '5c0f66b979af55031b34728a'
                });
                return user.save();
            })
            .then(() => {
                done();
            });
    });

    it('should add a created post to the posts of the creator', function(done) {
        // this.timeout(15000);
        // setTimeout(done, 15000);
        const stub = sinon.stub(io, 'getIO').callsFake(() => {
            return {
              emit: function() {}
            }
        });
        const req = {
            body: {
                title:'Test Post',
                content: 'A Test Post',
            },
            file: {
                path: 'abc'
            },
            userId: '5c0f66b979af55031b34728a'
        };
        const res = {
            status: function() { return this; }, json: function() {}
        };

        FeedController.createPost(req, res, () => {}).then(savedUser => {
            expect(savedUser).to.have.property('posts');
            expect(savedUser.posts).to.have.length(1);
            stub.restore();
            done();
        });

    });

    after(function(done) {
        User.deleteMany({})
            .then(() => {
                return mongoose.disconnect(); 
            })
            .then(() => {
                done();
            });
    });
});
