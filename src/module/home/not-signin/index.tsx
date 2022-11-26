import { Alert, Button, Divider, Form, Space } from "antd";
import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { useMutation, useQuery } from "react-query";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { BsGoogle } from "react-icons/bs";
import authService from "services/auth";

import HerokuImage from "assets/svgs/heroku-image.svg";

import { SignInEmail } from "models";
import ControlledInputText from "components/form/controlled-inputs/controlled-input-text";
import { SIGN_UP_PATH } from "utils/routes";
import { Link } from "react-router-dom";
import userService from "services/user";


function HomeNotSigin() {
    return (
        <div className="CONTAINER grid grid-cols-1 md:grid-cols-2 items-center min-h-screen">
            <div className="flex-1">
                <img src={HerokuImage} alt="heroku" className="w-full md:w-auto" />
            </div>
        </div>
    );
}

export default HomeNotSigin;
