import { Breadcrumb, BreadcrumbItem } from "flowbite-react";
import { HiHome } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

interface Props {
  currentPath: string;
}

export default function BreadcrumbComponent({ currentPath }: Props) {
  const navigate = useNavigate();
  const breadcrumbParts = currentPath.split("/").filter(Boolean);

  return (
    <Breadcrumb aria-label="Default breadcrumb example">
      <BreadcrumbItem
        icon={HiHome}
        onClick={() => navigate("/organizer/dashboard")}
        className="cursor-pointer"
      >
        Home
      </BreadcrumbItem>
      {breadcrumbParts.map((part, idx) => {
        const currentPath = "/" + breadcrumbParts.slice(0, idx + 1).join("/");
        const label = part
          .split("-") // Jika ada dash, pisah
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Kapitalisasi setiap kata
          .join(" "); // Gabungkan kembali dengan spasi

        if (idx === 0) return;
        return (
          <BreadcrumbItem
            key={`breadcrumb-${idx}`}
            onClick={() => navigate(currentPath)}
            className="cursor-pointer"
          >
            {label}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
}
