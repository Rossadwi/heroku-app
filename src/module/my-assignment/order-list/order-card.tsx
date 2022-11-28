import { Alert, Button, Card, Image, message, Modal, Skeleton, Space, Steps } from "antd";
import State from "components/common/state";
import { ChatInfo, Review, Service, ServiceOwnerOrder } from "models";
import { BiLink } from "react-icons/bi";
import moment from "moment";
import { AiFillFile } from "react-icons/ai";
import React, { useCallback, useContext, useMemo, useRef } from "react";
import { useMutation, useQuery } from "react-query";
import { Link } from "react-router-dom";
import ownerService from "services/owner";
import userService from "services/user";
import { IMAGE_FALLBACK, LIMIT_REVISION } from "utils/constant";
import { SERVICE_OWNER_PATH } from "utils/routes";
import { FaTelegramPlane, FaUserAlt } from "react-icons/fa";
import ButtonFileDownload from "components/button/file-download";
import { IoMdWarning } from "react-icons/io";
import authService from "services/auth";
import ButtonChat from "components/button/chat";
import Utils from "utils";
import UserHeader from "components/common/user-header";
import ReviewModal from "components/modal/review-modal";
import { UserContext } from "context/user";
import { ActionContext } from "context/action";

type Props = {
    data: ServiceOwnerOrder;
    refetchFetcher: () => void;
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

function OrderCard({ data, refetchFetcher }: Props) {
    const user = authService.CurrentUser();
    const { state } = useContext(UserContext);
    const { serviceReview } = useContext(ActionContext);

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

    const userHeader = useCallback(
        () => (
            <UserHeader uid={data.hid}>
                <>
                    <Link to={`${SERVICE_OWNER_PATH}/${data.sid}`}>
                        <p className="m-0 text-blue-300 capitalize text-sm">
                            {serviceQuery.data?.title} <BiLink />
                        </p>
                    </Link>
                    <p className="m-0 text-gray-400 text-xs capitalize">{moment(data.date).format("DD MMM yyyy, LT")}</p>
                </>
            </UserHeader>
        ),
        [serviceQuery.data]
    );

    const approveMutation = useMutation(
        async () => {
            await ownerService.ApproveOrderService({ uid: user?.uid as any, order: data });
        },
        {
            onSuccess: () => {
                message.success("Thankyou for your order ❤️");
                if (serviceReview) {
                    serviceReview({
                        header: userHeader(),
                        review: {
                            anyid: serviceQuery.data?.id,
                            heroUid: serviceQuery.data?.uid,
                            name: state.user?.name,
                            reviewerUid: state.user?.uid,
                        },
                    });
                }
            },
            onError: (error: any) => {
                message.error(error?.message);
            },
        }
    );

    const actions = [
        {
            status: 3,
            button: (
                <Button
                    loading={approveMutation.isLoading}
                    disabled={approveMutation.isLoading}
                    onClick={() => approveMutation.mutate()}
                    type="primary"
                >
                    Approve
                </Button>
            ),
        },
    ];

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

    const chatId = Utils.createChatId({ uids: [user?.uid as any, userQuery.data?.uid as any], postfix: serviceQuery.data?.id as any });
    const chatInfo: ChatInfo = {
        anyid: serviceQuery.data?.id as any,
        anytitle: serviceQuery.data?.title as any,
        type_work: "service",
        uid: userQuery.data?.uid as any,
        cid: chatId,
        id: chatId,
    };

    return (
        <Card className="flex flex-col !mb-4">
            {userHeader()}
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
                    {data.files
                        ?.filter((file) => file)
                        ?.map((fl, i) => (
                            <ButtonFileDownload url={fl} name={`document-${i + 1}`} />
                        ))}
                </Space>
                <Space>
                    {actions?.find((act) => act.status === data.status)?.button}
                    <ButtonChat chatInfo={chatInfo} disabled={serviceQuery.isLoading || userQuery.isLoading} />
                </Space>
            </div>
        </Card>
    );
}

export default OrderCard;
