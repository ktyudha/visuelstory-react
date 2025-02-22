import _adminRoutes from "./_admin.routes";
import _authRoutes from "./_auth.routes";
import _userRoutes from "./_user.routes";

export default function GetBrowserRoutes() {
  return [..._authRoutes, ..._userRoutes, ..._adminRoutes];
}
