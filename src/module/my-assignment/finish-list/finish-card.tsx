import { Alert, Button, Card, Image, message, Modal, Skeleton, Space, Steps } from "antd";
import State from "components/common/state";
import { ServiceOwnerFinish, ServiceOwnerOrder } from "models";
import { BiLink } from "react-icons/bi";
import moment from "moment";
import { AiFillFile } from "react-icons/ai";
import React, { useMemo } from "react";
import { useMutation, useQuery } from "react-query";
import { Link } from "react-router-dom";
import ownerService from "services/owner";
import userService from "services/user";
import { IMAGE_FALLBACK, LIMIT_REVISION } from "utils/constant";
import { SERVICE_OWNER_PATH } from "utils/routes";
import { FaTelegramPlane } from "react-icons/fa";
import ButtonFileDownload from "components/button/file-download";
import { IoMdWarning } from "react-icons/io";
import authService from "services/auth";

type Props = {
    data: ServiceOwnerFinish;
};

const steps = [
    {
        title: "Start",
        description: "Starting on project",
        subTitle: "",
    },
    {
        title: "Processing",
        description: "In the process of services",
        subTitle: "",
    },
    {
        title: "Deliver",
        description: "Send work",
        subTitle: "",
    },
    {
        title: "Checking",
        description: "Check work results",
        subTitle: "",
    },
];

function FinishCard({ data }: Props) {
    const userQuery = useQuery(
        ["user", data.hid],
        async () => {
            const usr = await userService.GetUser(data.hid as any);
            return usr;
        },
        {
            enabled: !!data.hid,
        }
    );

    const serviceQuery = useQuery(
        ["service", data.sid],
        async () => {
            const service = ownerService.GetOneService({ sid: data.sid });
            return service;
        },
        {
            enabled: !!data.uid,
        }
    );

    const mergeSteps = useMemo(() => {
        return steps.map((step, i) => {
            const date = (() => {
                if (data.progress) {
                    if (data.progress[i]) return data.progress[i].date;
                    return "";
                }
                return "";
            })();
            return {
                ...step,
                subTitle: date,
            };
        });
    }, [data]);

    return (
        <Card className="flex flex-col !mb-4">
            <State data={userQuery.data} isLoading={userQuery.isLoading} isError={userQuery.isError}>
                {(state) => (
                    <>
                        <State.Data state={state}>
                            <div className="w-full flex">
                                <Image
                                    preview={false}
                                    referrerPolicy="no-referrer"
                                    fallback={IMAGE_FALLBACK}
                                    src={userQuery.data?.profile}
                                    width={40}
                                    height={40}
                                    className="flex-1 bg-gray-300 rounded-full object-cover"
                                />
                                <div className="flex flex-col ml-3">
                                    <p className="m-0 font-semibold text-gray-500 capitalize">{userQuery.data?.name}</p>
                                    <Link to={`${SERVICE_OWNER_PATH}/${data.uid}/${data.sid}`}>
                                        <p className="m-0 text-blue-300 capitalize text-sm">
                                            {serviceQuery.data?.title} <BiLink />
                                        </p>
                                    </Link>
                                    <p className="m-0 text-gray-400 text-xs capitalize">{moment(data.date).format("DD MMM yyyy, LT")}</p>
                                </div>
                            </div>
                        </State.Data>
                        <State.Loading state={state}>
                            <Skeleton paragraph={{ rows: 2 }} avatar />
                        </State.Loading>
                        <State.Error state={state}>
                            <Alert message={(userQuery.error as any)?.message} type="error" />
                        </State.Error>
                    </>
                )}
            </State>
            <div className="flex flex-col items-center justify-center my-10 px-20">
                <Steps current={data.status}>
                    {mergeSteps.map((step) => (
                        <Steps.Step
                            key={step.title}
                            title={step.title}
                            description={step.description}
                            subTitle={step.subTitle ? moment(step.subTitle).format("DD MMM, LT") : ""}
                        />
                    ))}
                </Steps>
            </div>
            <div className="w-full flex justify-between">
                <Space direction="vertical">
                    {data.files?.map((fl, i) => {
                        if (!fl) return null;
                        return <ButtonFileDownload url={fl} name={`document-${i + 1}`} />;
                    })}
                </Space>
                <button
                    disabled={userQuery.isLoading}
                    className="cursor-pointer justify-self-end rounded-full w-10 h-10 bg-white border-solid border border-primary flex items-center justify-center"
                    type="button"
                >
                    <FaTelegramPlane className="text-primary text-2xl" />
                </button>
            </div>
        </Card>
    );
}

export default FinishCard;
