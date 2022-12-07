<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{

    public function checkAuth(Request $request)
    {
        // setting the credentials array
        $credentials = [
            'email' => $request->input('email'),
            'password' => $request->input('password')
        ];

        // if the credentials are wrong
        if (!Auth::attempt($credentials)) {
            return response('Username and/or password is incorrect', 403);
        }

        return response(Auth::user(), 201);
    }
}
