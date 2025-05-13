from api_v1.users.UserModels import UserLoginForm

def create_user(user: UserLoginForm) -> dict:
    user = user.model_dump()
    return {
        "success": True,
        "user": user,
    }