<?php

namespace Neoan3\Components;

use Neoan3\Apps\Stateless;
use Neoan3\Frame\Vastn3;
use Neoan3\Model\UserModel;

/**
 * Class Login
 * @package Neoan3\Components
 */
class Login extends Vastn3
{
    static function dependencies()
    {
        return ['animation'];
    }

    /**
     *
     */
    function init()
    {
        $this
            ->hook('main', 'login', [])
            ->vueComponents(['login', 'register'])
            ->output();
    }

    /**
     * @param array $login
     * @return array|mixed
     * @throws \Neoan3\Apps\DbException
     * @throws \Neoan3\Core\RouteException
     */
    function postLogin(array $login)
    {
        usleep(700);
        $user = UserModel::login($login);
        $validThrough = $this->validPeriod();
        $jwt = Stateless::assign($user['id'], 'all', ['exp' => $validThrough]);
        return ['token' => $jwt, 'user' => $user, 'validThrough' => $validThrough * 1000];
    }

    /**
     * @throws \Neoan3\Core\RouteException
     */
    function putLogin()
    {
        $jwt = Stateless::restrict();
        $validThrough = $this->validPeriod();
        return [
            'token' => Stateless::assign($jwt['jti'], $jwt['scope'], ['exp' => $validThrough]),
            'validThrough' => $validThrough * 1000
        ];
    }

    private function validPeriod()
    {
        return time() + (2 * 60 * 60);
    }
}