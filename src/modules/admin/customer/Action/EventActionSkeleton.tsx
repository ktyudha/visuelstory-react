import Skeleton from "@components/Skeleton/Skeleton";
import { Label } from "flowbite-react";

interface Props {
  isLoading: boolean;
}
export default function EventActionSkeleton({ isLoading }: Props) {
  return (
    <div className="flex lg:flex-row flex-col gap-4 justify-between">
      <div className="lg:w-1/4 w-full">
        <Label
          htmlFor={"image"}
          className={
            "flex gap-1 leading-4 text-[12px] text-neutral-800 mb-2 text-md"
          }
        >
          Image <div className="text-red-500">*</div>
        </Label>
        <Skeleton
          isLoading={isLoading}
          height="20rem"
          width="60%"
          borderRadius="14px"
        ></Skeleton>
      </div>
      <div className="lg:w-3/4 w-full">
        <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
          <div>
            <Label
              htmlFor={"start_date"}
              className={
                "flex gap-1 leading-4 text-[12px] text-neutral-800 mb-2 text-md"
              }
            >
              Start of Event <div className="text-red-500">*</div>
            </Label>
            <Skeleton
              isLoading={isLoading}
              height="2.5rem"
              borderRadius="10px"
            ></Skeleton>
          </div>
          <div>
            <Label
              htmlFor={"end_date"}
              className={
                "flex gap-1 leading-4 text-[12px] text-neutral-800 mb-2 text-md"
              }
            >
              End of Event <div className="text-red-500">*</div>
            </Label>
            <Skeleton
              isLoading={isLoading}
              height="2.5rem"
              borderRadius="10px"
            ></Skeleton>
          </div>
          <div>
            <Label
              htmlFor={"event_category_id"}
              className={
                "flex gap-1 leading-4 text-[12px] text-neutral-800 mb-2 text-md"
              }
            >
              Category <div className="text-red-500">*</div>
            </Label>
            <Skeleton
              isLoading={isLoading}
              height="2.5rem"
              borderRadius="10px"
            ></Skeleton>
          </div>
          <div>
            <Label
              htmlFor={"district_id"}
              className={
                "flex gap-1 leading-4 text-[12px] text-neutral-800 mb-2 text-md"
              }
            >
              District <div className="text-red-500">*</div>
            </Label>
            <Skeleton
              isLoading={isLoading}
              height="2.5rem"
              borderRadius="10px"
            ></Skeleton>
          </div>
        </div>
        <div>
          <Label
            htmlFor={"title"}
            className={
              "flex gap-1 leading-4 text-[12px] text-neutral-800 mb-2 text-md"
            }
          >
            Title <div className="text-red-500">*</div>
          </Label>
          <Skeleton
            isLoading={isLoading}
            height="2.5rem"
            borderRadius="10px"
          ></Skeleton>
        </div>
        <div>
          <Label
            htmlFor={"description"}
            className={
              "flex gap-1 leading-4 text-[12px] text-neutral-800 mb-2 text-md"
            }
          >
            Description <div className="text-red-500">*</div>
          </Label>
          <Skeleton
            isLoading={isLoading}
            height="7.5rem"
            borderRadius="10px"
          ></Skeleton>
        </div>
      </div>
    </div>
  );
}
