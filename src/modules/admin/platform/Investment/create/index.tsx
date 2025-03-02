import { useEffect, useState } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import useCreateInvestment from "@services/admin/investment/hooks/create.type";
import useUpdateInvestment from "@services/admin/investment/hooks/update.type";
import useGetAllInvestment from "@services/admin/investment/hooks/get-all.type";
import { ICreateUpdateInvestmentPayload } from "@services/admin/investment/interfaces/create-update.types";
import { IGetAllInvestmentResponse } from "@services/admin/investment/interfaces/get-all.types";

import Card from "@components/Card";
import Spinner from "@components/Reusable/Spinner";
import FormInput from "@components/Form/FormInput";
import Skeleton from "@components/Skeleton/Skeleton";
import { Button } from "@components/ui/button";
// import { dummyTypeInvestment } from "@constants/dummy";
// import InvImage from "@assets/images/pricelist-1.png";

type FormFields = ICreateUpdateInvestmentPayload;

export default function InvestmentCreate() {
  const methods = useForm<FormFields>({ mode: "onChange" });
  const { isSubmitting } = methods.formState;
  const isValid = methods.formState.isValid;

  // const [imagePreview, setImagePreview] = useState<string | null>(null);
  // const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [investment, setInvestment] =
    useState<IGetAllInvestmentResponse | null>(null);
  const [pricelistCount, setPricelistCount] = useState(1);

  const { data, isLoading } = useGetAllInvestment();
  const { createInvestment } = useCreateInvestment();
  const { updateContact } = useUpdateInvestment();

  useEffect(() => {
    if (data?.length) {
      setInvestment(data?.[0] as IGetAllInvestmentResponse);
    }
  }, [data]);

  useEffect(() => {
    if (investment?.investments) {
      setPricelistCount(investment.investments.length);
    }
  }, [investment]);

  // const handleButtonClick = () => {
  //   fileInputRef.current?.click();
  // };

  // const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     event.target.value = "";
  //     const previewUrl = URL.createObjectURL(file);
  //     setImagePreview(previewUrl);
  //   }
  // };

  // const handleRemoveImage = () => {
  //   setImagePreview(null);
  // };

  const handleRemovePricelist = (indexToRemove: number) => {
    if (pricelistCount > 1) {
      setInvestment((prevInvestment) => {
        if (!prevInvestment || !prevInvestment.investments)
          return prevInvestment;
        if (prevInvestment.investments.length == pricelistCount) {
          const updatedInvestments = prevInvestment.investments.filter(
            (_, index) => index !== indexToRemove
          );
          return { ...prevInvestment, investments: updatedInvestments };
        }
        return prevInvestment;
      });

      setPricelistCount((prev) => Math.max(prev - 1, 1));
    }
  };

  const onSubmit: SubmitHandler<FormFields> = async (state) => {
    try {
      const { error } = investment?.id
        ? await updateContact(investment?.id, { ...state })
        : await createInvestment({ ...state });
      if (error) {
        toast.error(`Gagal ${investment?.id ? "Mengupdate" : "Menambahkan"}`, {
          position: "top-right",
        });
      } else {
        toast.success(
          `Berhasil ${investment?.id ? "Mengupdate" : "Menambahkan"}`,
          {
            position: "top-right",
          }
        );
        methods.reset();
      }
    } catch (error: any) {
      toast.error((error as Error).message, {
        position: "top-right",
      });
    }
  };

  useEffect(() => {
    if (investment) {
      methods.reset(investment);
    }
  }, [investment, methods]);

  return (
    <>
      <div className="mb-1">
        <h2 className="font-medium">Pricelist</h2>
      </div>

      <Card>
        <FormProvider {...methods}>
          <form className="w-full" onSubmit={methods.handleSubmit(onSubmit)}>
            <div className="flex gap-5 mb-3">
              <div className="flex-1">
                <div className="flex flex-col gap-3 mb-3">
                  <Skeleton isLoading={isLoading} height="40px">
                    <FormInput
                      label="Title"
                      type="text"
                      placeholder="Title"
                      name="title"
                      defaultValue={investment?.title || "pricelist"}
                      isRequired
                    />
                  </Skeleton>

                  <Skeleton isLoading={isLoading} height="40px">
                    <FormInput
                      label="Description"
                      type="text"
                      placeholder="Description"
                      name="description"
                      defaultValue={investment?.description || "investemnet"}
                      isRequired
                    />
                  </Skeleton>

                  <Skeleton isLoading={isLoading} height="40px">
                    <FormInput
                      label="Whatsapp"
                      type="text"
                      placeholder="Whatsapp"
                      name="whatsapp"
                      defaultValue={investment?.whatsapp || "085"}
                      isRequired
                    />
                  </Skeleton>

                  <hr />
                  <div className="flex flex-col gap-4">
                    <Button
                      type="button"
                      className="w-full py-5 lg:order-1 order-2"
                      onClick={() => setPricelistCount((prev) => prev + 1)}
                    >
                      + Add Pricelist
                    </Button>

                    <div className="grid lg:grid-cols-3 grid-cols-1 gap-4 lg:order-2 order-1">
                      {Array.from({
                        length: pricelistCount,
                      }).map((_, index) => (
                        <div key={index} className="flex flex-col gap-3">
                          <h1>Pricelist {index + 1}</h1>
                          <Skeleton isLoading={isLoading} height="40px">
                            <FormInput
                              label="Name"
                              type="text"
                              placeholder="Name"
                              name={`investments[${index}][name]`}
                              defaultValue={
                                investment?.investments?.[index]?.name || ""
                              }
                              isRequired
                            />
                          </Skeleton>
                          <Skeleton isLoading={isLoading} height="40px">
                            <FormInput
                              label="Type"
                              type="text"
                              placeholder="Type"
                              name={`investments[${index}][type]`}
                              defaultValue={
                                investment?.investments?.[index]?.type || ""
                              }
                              isRequired
                            />
                          </Skeleton>

                          {/* <Skeleton isLoading={isLoading} height="40px">
                            <FormInput
                              label="Image"
                              type="file"
                              placeholder="Choose Cover"
                              name={`investments[${index}][image]`}
                              defaultValue={
                                investment?.investments?.[index]?.image || ""
                              }
                              isRequired
                            />
                          </Skeleton> */}

                          {/* <div className="flex flex-row">
                            {imagePreview ? (
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-[165px] h-[165px] object-cover rounded-lg mb-[-2px] z-10 relative"
                              />
                            ) : (
                              <img
                                src={InvImage}
                                alt="image-buku-cover"
                                className="w-[165px] h-[165px] object-cover rounded-lg mb-[-2px] z-10 relative"
                              />
                            )}

                            <div className="flex flex-col gap-4 mx-auto">
                              <Button
                                type="button"
                                className="text-sm py-2 px-[32.5px] rounded-[14px]"
                                onClick={handleButtonClick}
                              >
                                Pilih Cover
                              </Button>

                              <Button
                                type="button"
                                className="bg-white dark:bg-black text-[#EF4444] border border-[#EF4444] text-sm py-2 px-[32.5px] rounded-[14px]"
                                onClick={handleRemoveImage}
                              >
                                Hapus Cover
                              </Button>
                            </div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={handleImageUpload}
                            />
                          </div> */}

                          {pricelistCount > 1 && (
                            <Button
                              type="button"
                              className="py-5 bg-red-500 text-white"
                              onClick={() => handleRemovePricelist(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:w-3xs w-full mt-6 mb-3 flex gap-5 justify-center">
              <Skeleton isLoading={isLoading} height="40PX">
                <button
                  type="submit"
                  className={`w-full rounded-lg py-2 font-medium text-base text-white ${
                    !isValid || isSubmitting
                      ? "bg-[#9fe194] cursor-not-allowed focus:outline-none disabled:opacity-100"
                      : "bg-[#4bb43a] hover:bg-[#379029]"
                  }`}
                  disabled={!isValid || isSubmitting}
                >
                  {!isSubmitting ? (
                    investment?.id ? (
                      "Update"
                    ) : (
                      "Submit"
                    )
                  ) : (
                    <Spinner />
                  )}
                </button>
              </Skeleton>
            </div>
          </form>
        </FormProvider>
      </Card>
    </>
  );
}
