import {Button} from "@heroui/button";
import { useLocation, useNavigate } from '@tanstack/react-router'

export default function LoginToAnswer() {
    const location = useLocation()
    const navigate = useNavigate();
    return (
        <Button
            className="my-4 ml-16"
            variant="solid"
            color="secondary"
            onPress={async () => {
                await navigate({to :'/profiles/signin', search: { redirect: location.pathname }});
            }}
        >
            Login to Answer
        </Button>
    );
}