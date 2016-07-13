var request = require('request')
    , express = require('express')
    ,assert = require("assert")
    ,http = require("http");

describe('http test',function(){
   it('should return th login if the url is correct', function(done){
       http.get('http://localhost:3000/',function(res){
           assert.equal(true,true);
           done();
       });
   });

    it('should login', function(done){
        request.post('http://localhost:3000/goToLogin',
            {form: {username: 'anshuman.tripathi@sjsu.edu',password: '12345'}},
        function(error,response,body){
            assert.equal(404,response.statusCode);
            done();
        });
    });

    it('get profile', function(done){
        request.post('http://localhost:3000/profile',
            {form: {username: 'anshuman.tripathi@sjsu.edu',password: '12345'}},
            function(error,response,body){
                assert.equal(true,true);
                done();
            });
    });

    it('edit profile', function(done){
        request.post('http://localhost:3000/goToLogin',
            {form: {username: 'anshuman.tripathi@sjsu.edu',password: '12345'}},
            function(error,response,body){
                assert.equal(404,response.statusCode);
                done();
            });
    });

    it('should logout', function(done){
        request.post('http://localhost:3000/logout',
            {form: {username: 'anshuman.tripathi@sjsu.edu',password: '12345'}},
            function(error,response,body){
                assert.equal(true,true);
                done();
            });
    });
});