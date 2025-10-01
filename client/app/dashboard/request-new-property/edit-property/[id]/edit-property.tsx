"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { usePathname, useRouter } from "next/navigation";
import { useKYCModal } from "@/app/context/KYCModalContext";
import { useBitStakeContext } from "@/app/context/BitstakeContext";
import {
    BreakdownField,
    FormInputType,
    NftMetadata,
    RequestFormData,
} from "@/app/context/types";
import { uploadFileToIPFS, uploadJSONToIPFS } from "@/app/context/pinataTools";
import { _registerProperty } from "@/app/context/helper-form";
import {
    DELAY,
    fetchNftMetadata,
    getCustomWeiFrom,
    NotifyError,
    NotifySuccess,
} from "@/app/context/helper";
import {
    BITSTAKE_CONFIG,
    DEFAULT_IMAGES
} from "@/app/utils/constants";
import UserDashboard from "@/app/components/UserDashboard";
import { RequestNewPropertySkeleton } from "@/app/components/ui/SkeletonCard";
import { FiPlus, FiMinus } from "react-icons/fi";
import { MapPreview } from "@/app/components/MapPicker";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { Info } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import FileUpload, { FilePreview } from "@/app/dashboard/request-new-property/FileUpload";
import DocumentUpload, { DocumentPreview } from "@/app/dashboard/request-new-property/DocumentUpload";
import SaleTime from "@/app/dashboard/request-new-property/SaleTime";
import CountryDropdown from "@/app/dashboard/request-new-property/CountryDropdown";
import CityDropdown from "@/app/dashboard/request-new-property/CityDropdown";
import PropertyTypeDropdown from "@/app/dashboard/request-new-property/PropertyTypeDropdown";
import HomeTypeDropdown from "@/app/dashboard/request-new-property/HomeTypeDropdown";
import { Card, CardContent } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { _changeRwaPropertyApr, _changeRwaPropertyPrice, _changeRwaUri, _getPropertyDetails } from "@/app/context/helper-rwa";
import MapCoordinateSelector, { SelectedCoords } from "@/app/components/MapCoordinateSelector";

const MAX_IMAGES_UPLOADS = 5;
const MAX_DOCUMENT_UPLOADS = 5;
const ONE_HOUR_SECONDS = 3600;

export type ImgItem = File | string;
export type DocItem = File | { fileName: string; url: string };

const EditRequestNewProperty = ({ id }: { id: string }) => {
    const { address: account } = useAccount();
    const { kycStatus, openModal } = useKYCModal();

    const [formData, setFormData] = useState<RequestFormData>({
        name: "",
        description: "",
        city: "",
        country: "",
        homeType: "",
        propertyType: "",
        fractions: "",
        fractionPrice: "",
        days: 0,
        hours: 1,
        minutes: 0,
        view3d: "",
        longitude: undefined,
        latitude: undefined,
        aprBips: 0
    });

    const { particleProvider } = useBitStakeContext();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saleTime, setSaleTime] = useState<FormInputType[]>([]);
    const [homeTypes, setHomeTypes] = useState<FormInputType[]>([]);
    const [propertyTypes, setPropertyTypes] = useState<FormInputType[]>([]);
    const [imageFiles, setImageFiles] = useState<ImgItem[]>([]);
    const [files, setFiles] = useState<DocItem[]>([]);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [feeLoading, setFeeLoading] = useState(false);

    const [productLoading, setProductLoading] = useState<boolean>(false);
    const [product, setProduct] = useState<any>(null);
    const [metadata, setMetadata] = useState<NftMetadata>();

    const [newFractionPrice, setNewFractionPrice] = useState<string>("");
    const [newApr, setNewApr] = useState<string>("");

    const [transactionBreakdown, setTransactionBreakdown] = useState<
        BreakdownField[]
    >([{ key: "", value: "" }]);
    const [rentalBreakdown, setRentalBreakdown] = useState<BreakdownField[]>([
        { key: "", value: "" },
    ]);

    const [changeUriLoading, setChangeUriLoading] = useState(false);
    const [changePriceLoading, setChangePriceLoading] = useState(false);
    const [changeAprLoading, setChangeAprLoading] = useState(false);

    const [selectedCoords, setSelectedCoords] = useState<SelectedCoords | null>(
        null
    );

    const [loading, setLoading] = useState(false);
    const pathname = usePathname();

    const txKeyRefs = useRef<(HTMLInputElement | null)[]>([]);
    const txValRefs = useRef<(HTMLInputElement | null)[]>([]);
    const rentKeyRefs = useRef<(HTMLInputElement | null)[]>([]);
    const rentValRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Example data fetching
        setSaleTime([
            { label: "5 minutes", value: "300" }, // 1 hour = 3600 seconds //TODO : to be removed
            { label: "15 minutes", value: "900" }, // 1 hour = 3600 seconds //TODO : to be removed
            { label: "1 Hour", value: "3600" }, // 1 hour = 3600 seconds
            { label: "6 Hours", value: "21600" }, // 6 hours = 21600 seconds
            { label: "12 Hours", value: "43200" }, // 12 hours = 43200 seconds
            { label: "1 Day", value: "86400" }, // 1 day = 86400 seconds
            { label: "2 Day", value: String(86400 * 2) },
            { label: "3 Day", value: String(86400 * 3) },
            { label: "6 Day", value: String(86400 * 6) },
            { label: "10 Day", value: String(86400 * 10) },
            { label: "20 Day", value: String(86400 * 20) },
            { label: "30 Day", value: String(86400 * 30) },
            { label: "60 Day", value: String(86400 * 60) },
            { label: "90 Day", value: String(86400 * 90) },
            { label: "180 Day", value: String(86400 * 180) }
        ]);
        setHomeTypes([
            { value: "House", label: "House" },
            { value: "Apartment", label: "Apartment" },
        ]);
        setPropertyTypes([
            { value: "Real State", label: "Real State" },
            { value: "Stocks", label: "Stocks" },
            { value: "Residential", label: "Residential" },
            { value: "Commercial", label: "Commercial" },
        ]);
    }, []);

    const addField = (
        setter: React.Dispatch<React.SetStateAction<BreakdownField[]>>
    ) => setter((prev) => [...prev, { key: "", value: "" }]);

    const removeField = (
        idx: number,
        setter: React.Dispatch<React.SetStateAction<BreakdownField[]>>
    ) => setter((prev) => prev.filter((_, i) => i !== idx));

    const handleChange = (name: string, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            // Reset city if country changes
            ...(name === "country" ? { city: "" } : {}),
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name) newErrors.name = "Name is required";
        if (!formData.city) newErrors.city = "City is required";
        if (!formData.country) newErrors.country = "Country is required";
        if (!formData.homeType) newErrors.homeType = "Home type is required";
        if (!formData.propertyType)
            newErrors.propertyType = "Property type is required";
        if (!formData.description)
            newErrors.description = "Description is required";

        return newErrors;
    };

    // 1. Strip out any empty rows
    const filteredTransaction = transactionBreakdown.filter(
        ({ key, value }) =>
            key.trim() !== "" &&
            // only include if value is non-empty (number or non-empty string)
            (typeof value === "number" ? !isNaN(value) : String(value).trim() !== "")
    );

    const filteredRental = rentalBreakdown.filter(
        ({ key, value }) =>
            key.trim() !== "" &&
            // rental values can be string or number; drop if empty string
            String(value).trim() !== ""
    );

    useEffect(() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1500);
    }, [pathname]);

    useEffect(() => {
        if (formData.days === 180) {
            setFormData((prev) => ({
                ...prev,
                hours: 0,
                minutes: 0,
            }));
        }
    }, [formData.days]);

    // Transaction & Rental both simply keep strings now
    const updateTransactionField = (
        idx: number,
        field: "key" | "value",
        val: string
    ) => {
        setTransactionBreakdown((prev) =>
            prev.map((f, i) => (i === idx ? { ...f, [field]: val } : f))
        );
    };

    const updateRentalField = (
        idx: number,
        field: "key" | "value",
        val: string
    ) => {
        setRentalBreakdown((prev) =>
            prev.map((f, i) => (i === idx ? { ...f, [field]: val } : f))
        );
    };

    const handleGetPropertyDetails = async (propertyId: number) => {
        setProductLoading(true); // Start loading
        setProduct(null); // Set the product details
        setMetadata(undefined); // Set the metadata
        try {
            const details = await _getPropertyDetails({ propertyId });
            if (details === null) {
                setProduct(null); // Set the product details
                setMetadata(undefined); // Set the metadata
                return;
            }
            const metadata: NftMetadata | null = await fetchNftMetadata(details.uri);

            const validMetadata: NftMetadata = {
                description: metadata?.description || "----",
                image: metadata?.image || DEFAULT_IMAGES[0],
                images: metadata?.images || DEFAULT_IMAGES,
                name: metadata?.name || "----",
                attributes: metadata?.attributes || [],
                transactionBreakdown: metadata?.transactionBreakdown || [],
                rentalBreakdown: metadata?.rentalBreakdown || [],
                documents: metadata?.documents || [],
                view3d: metadata?.view3d,
                location: metadata?.location
            };

            setProduct(details); // Set the product details
            setMetadata(validMetadata); // Set the metadata
        } catch (error) {
            console.log("Error fetching property details:", error);
        } finally {
            setProductLoading(false); // Stop loading after data is fetched or error occurs
        }
    };

    const handleChangePropertyPrice = async () => {
        try {
            if (!account || !particleProvider)
                throw new Error("Please connect wallet");
            setChangePriceLoading(true);

            if (kycStatus !== "completed") {
                await openModal(account);
                throw new Error("Complete KYC in order to continue");
            }
            if (!newFractionPrice || isNaN(Number(newFractionPrice)) || Number(newFractionPrice) <= 0) {
                return NotifyError("Please enter a valid fraction price.");
            }

            const newPrice = Number(newFractionPrice);
            const newPricePerShareInWei = getCustomWeiFrom(String(newPrice), BITSTAKE_CONFIG.usdcDecimals);

            await _changeRwaPropertyPrice({
                propertyId: parseInt(id),
                newPricePerShareInWei: newPricePerShareInWei,
                particleProvider,
            });

            await handleGetPropertyDetails(parseInt(id));
            NotifySuccess("Property price updated successfully");
        } catch (error: any) {
            NotifyError(error.reason || error.message || "Something went wrong");
        } finally {
            setChangePriceLoading(false);
        }
    };

    const handleChangePropertyApr = async () => {
        try {
            if (!account || !particleProvider)
                throw new Error("Please connect wallet");
            setChangeAprLoading(true);

            if (kycStatus !== "completed") {
                await openModal(account);
                throw new Error("Complete KYC in order to continue");
            }

            if (!newApr || isNaN(Number(newApr)) || Number(newApr) < 0 || Number(newApr) > 100) {
                return NotifyError("Please enter a valid apr %.");
            }

            const userNewApr = Number(newApr);
            const newAprBips = userNewApr * 10;
            console.log("🚀 ~ handleChangePropertyApr ~ newAprBips:", newAprBips)
            await _changeRwaPropertyApr({
                propertyId: parseInt(id),
                newAprBips,
                particleProvider,
            });
            await handleGetPropertyDetails(parseInt(id));
            NotifySuccess("Property APR updated successfully");
        } catch (error: any) {
            NotifyError(error.reason || error.message || "Something went wrong");
        } finally {
            setChangeAprLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        console.log("Form submitted:", formData);
        e.preventDefault();
        try {
            if (!account) throw new Error("Please connect wallet");
            if (Number(formData.fractionPrice) < 0) throw new Error("Invalid Price");
            if (kycStatus !== "completed") {
                await openModal(account);
                throw new Error("Complete KYC in order to continue");
            }
            if (files.length === 0)
                throw new Error("No file selected. Please select file to upload.");
            if (imageFiles.length === 0)
                throw new Error("No images selected. Please select images to upload.");

            setSubmitLoading(true);
            setChangeUriLoading(true);

            // validation
            const formValidationErrors = validateForm();
            if (Object.keys(formValidationErrors).length > 0) {
                setErrors(formValidationErrors);
                throw new Error("Validation failed");
            }

            // split off File vs existing…
            const newDocFiles = files.filter((f): f is File => f instanceof File);
            const existingDocs = files.filter(
                (f): f is { fileName: string; url: string } => !(f instanceof File)
            );
            const newImgFiles = imageFiles.filter((f): f is File => f instanceof File);
            const existingImgUrls = imageFiles.filter(
                (f): f is string => typeof f === "string"
            );

            // upload only new Files
            const [docResponses, imageResponses] = await Promise.all([
                Promise.all(newDocFiles.map(uploadFileToIPFS)),
                Promise.all(newImgFiles.map(uploadFileToIPFS))
            ]);

            // gather IPFS URLs
            const documentUrls: string[] = [];
            docResponses.forEach(r => {
                if (r.success && r.pinataURL) documentUrls.push(r.pinataURL);
            });

            const imageUrls = [...existingImgUrls];
            imageResponses.forEach(r => {
                if (r.success && r.pinataURL) imageUrls.push(r.pinataURL);
            });

            // build combined docs
            const documentsInfo = [
                ...existingDocs,
                ...newDocFiles.map((file, idx) => ({
                    fileName: file.name,
                    url: documentUrls[idx],
                }))
            ];

            // build your metadata object
            const nftMetadataJson: NftMetadata = {
                name: formData.name,
                description: formData.description,
                image: imageUrls[0],
                ...(formData.view3d ? { view3d: formData.view3d } : {}),
                images: imageUrls,
                documents: documentsInfo,
                attributes: [
                    { trait_type: "City", value: formData.city },
                    { trait_type: "Country", value: formData.country },
                    { trait_type: "PropertyType", value: formData.propertyType },
                    { trait_type: "HomeType", value: formData.homeType },
                ],
                transactionBreakdown: filteredTransaction,
                rentalBreakdown: filteredRental,
                ...(formData.latitude != null && formData.longitude != null
                    ? { location: { latitude: formData.latitude, longitude: formData.longitude } }
                    : {}),
            };

            const metadataUriResponse = await uploadJSONToIPFS(nftMetadataJson);
            if (!metadataUriResponse.success) {
                throw new Error(metadataUriResponse.message);
            }

            const newUri = metadataUriResponse.pinataURL as string;

            await _changeRwaUri({
                propertyId: parseInt(id),
                newUri,
                particleProvider,
            });

            await handleGetPropertyDetails(parseInt(id));
            NotifySuccess("Property data updated successfully");

        } catch (error: any) {
            NotifyError(error.reason || error.message || "Something went wrong");
        } finally {
            setSubmitLoading(false);
            setChangeUriLoading(false);
        }
    };

    useEffect(() => {
        if (!product || !metadata) return;

        // 1) Pre-fill the main form:
        setFormData({
            name: metadata.name,
            description: metadata.description,
            city: metadata.attributes.find(a => a.trait_type === "City")?.value || "",
            country: metadata.attributes.find(a => a.trait_type === "Country")?.value || "",
            propertyType: metadata.attributes.find(a => a.trait_type === "PropertyType")?.value || "",
            homeType: metadata.attributes.find(a => a.trait_type === "HomeType")?.value || "",
            fractions: String(product.totalShares),
            fractionPrice: String(product.pricePerShare),
            days: 0,      // adjust if you have saleTime on `product`
            hours: 0,
            minutes: 0,
            view3d: metadata.view3d ?? "",
            latitude: metadata.location?.latitude,
            longitude: metadata.location?.longitude,
            aprBips: product.aprBips,
        });

        // 2) Pre-fill breakdowns
        setTransactionBreakdown(metadata.transactionBreakdown);
        setRentalBreakdown(metadata.rentalBreakdown);

        // 3) Show existing images/docs in preview components
        setImageFiles(metadata.images || []);
        setFiles(metadata.documents || []);

    }, [product, metadata]);

    useEffect(() => {
        if (selectedCoords) {
            handleChange("latitude", selectedCoords.lat)
            handleChange("longitude", selectedCoords.lng)
        }
    }, [selectedCoords])

    // 3) also, if you ever prefill formData (e.g. from metadata),
    //    make sure you seed selectedCoords so map and inputs stay in sync:
    useEffect(() => {
        const { latitude, longitude } = formData
        if (latitude != null && longitude != null) {
            setSelectedCoords({ lat: latitude, lng: longitude })
        }
    }, [formData.latitude, formData.longitude])

    useEffect(() => {
        if (!id) return;
        handleGetPropertyDetails(Number(id));
    }, [id]);

    useEffect(() => {
        if (!product) return;
        setNewFractionPrice("");
        setNewApr("");
    }, [product]);

    const lastTx = transactionBreakdown[transactionBreakdown.length - 1];
    const canAddTransaction =
        lastTx.key.trim() !== "" && lastTx.value.trim() !== "";

    const lastRental = rentalBreakdown[rentalBreakdown.length - 1];
    const canAddRental =
        lastRental.key.trim() !== "" && lastRental.value.trim() !== "";

    return (
        <UserDashboard>
            <div>
                {loading || productLoading || !metadata || !product ? (
                    <RequestNewPropertySkeleton />
                ) : (
                    <div className="w-full max-w-[1400px] mx-auto sm:px-4 space-y-6">
                        <div className="flex w-full gap-4 items-center">
                            <Card className="w-full md:w-1/2">
                                <CardContent className="space-y-6">
                                    <Card className="rounded-xl">
                                        <CardContent>
                                            <div className="space-y-2">
                                                <p className="text-base 3xl:text-xl text-grey-6">Current Fraction Price</p>
                                                <p className="text-2xl 3xl:text-3xl font-bold">{feeLoading ? <Skeleton className="h-14 w-32" /> : `${formData.fractionPrice} USDC`}</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="space-y-3">
                                        <Label>
                                            Enter New Fraction Price
                                        </Label>
                                        <Input
                                            type="number"
                                            placeholder="New Fraction Price"
                                            value={newFractionPrice}
                                            onChange={e => setNewFractionPrice(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        className="w-full"
                                        onClick={handleChangePropertyPrice}
                                        loading={changePriceLoading}
                                    >
                                        Update Fraction Price
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* // TODO: comment because waiting for new contract to be deploy */}
                            {/* <Card className="w-full md:w-1/2">
                                <CardContent className="space-y-6">
                                    <Card className="rounded-xl">
                                        <CardContent>
                                            <div className="space-y-2">
                                                <p className="text-base 3xl:text-xl text-grey-6">Current APR</p>
                                                <p className="text-2xl 3xl:text-3xl font-bold">{feeLoading ? <Skeleton className="h-14 w-32" /> : `${formData.aprBips}%`}</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="space-y-3">
                                        <Label>
                                            Enter New Value
                                        </Label>
                                        <Input
                                            type="number"
                                            placeholder="New APR %"
                                            value={newApr}
                                            onChange={e => setNewApr(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        className="w-full"
                                        onClick={handleChangePropertyApr}
                                        loading={changeAprLoading}
                                    >
                                        Update APR %
                                    </Button>
                                </CardContent>
                            </Card> */}
                        </div>
                        <form className="w-full space-y-6 3xl:space-y-8" onSubmit={handleSubmit}>
                            <div className="flex xl:flex-row flex-col gap-6">
                                <div className="w-full xl:w-1/2">
                                    {files.length < MAX_IMAGES_UPLOADS && (
                                        <FileUpload setImageFiles={setImageFiles} />
                                    )}
                                    <FilePreview
                                        imageFiles={imageFiles}
                                        setImageFiles={setImageFiles}
                                    />
                                </div>

                                <div className="w-full xl:w-1/2">
                                    {files.length < MAX_DOCUMENT_UPLOADS && (
                                        <DocumentUpload setFiles={setFiles} />
                                    )}
                                    <DocumentPreview files={files} setFiles={setFiles} />
                                </div>
                            </div>

                            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                                <div className="space-y-2 w-full">
                                    <fieldset className="relative border border-black rounded-md py-4 px-3 w-full">
                                        <legend className="absolute top-0 left-2 transform -translate-y-1/2 px-2 text-sm text-black bg-lightBlue">
                                            Name
                                        </legend>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={(e) =>
                                                handleChange(e.target.name, e.target.value)
                                            }
                                            className="w-full border-none outline-none text-black text-base font-normal bg-transparent"
                                            placeholder="Enter property name"
                                        />
                                    </fieldset>
                                    {errors.name && <p className="text-red-500">{errors.name}</p>}
                                </div>

                                <div className="space-y-2 w-full">
                                    <CountryDropdown
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        placeholder="Select country"
                                    />
                                    {errors.country && (
                                        <p className="text-red-500">{errors.country}</p>
                                    )}
                                </div>

                                <div className="space-y-2 w-full">
                                    <CityDropdown
                                        name="city"
                                        value={formData.city}
                                        country={formData.country}
                                        onChange={handleChange}
                                        placeholder="Select city"
                                    />
                                    {errors.city && <p className="text-red-500">{errors.city}</p>}
                                </div>

                                <div className="space-y-2 w-full">
                                    <PropertyTypeDropdown
                                        name="propertyType"
                                        value={formData.propertyType}
                                        options={propertyTypes}
                                        onChange={handleChange}
                                        placeholder="Select a property type"
                                    />
                                    {errors.propertyType && (
                                        <p className="text-red-500">{errors.propertyType}</p>
                                    )}
                                </div>

                                <div className="space-y-2 w-full">
                                    <HomeTypeDropdown
                                        name="homeType"
                                        value={formData.homeType}
                                        options={homeTypes}
                                        onChange={handleChange}
                                        placeholder="Select a home type"
                                    />
                                    {errors.homeType && (
                                        <p className="text-red-500">{errors.homeType}</p>
                                    )}
                                </div>

                                <div className="w-full">
                                    <fieldset className="relative border border-black rounded-md py-4 px-3 w-full">
                                        <legend className="absolute top-0 left-2 transform -translate-y-1/2 px-2 text-sm text-black bg-lightBlue">
                                            3D View URL (optional)
                                        </legend>
                                        <input
                                            type="url"
                                            name="view3d"
                                            value={formData.view3d}
                                            onChange={(e) =>
                                                handleChange(e.target.name, e.target.value)
                                            }
                                            className="w-full border-none outline-none text-black text-base font-normal bg-transparent"
                                            placeholder="https://3d-model-link.com"
                                        />
                                    </fieldset>
                                </div>

                            </div>

                            {/* Description Textarea */}
                            <div className="space-y-2 w-full">
                                <fieldset className="relative border border-black rounded-md px-3">
                                    <legend className="absolute top-0 left-2 -translate-y-1/2 px-2 text-sm text-black bg-lightBlue">
                                        Description
                                    </legend>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={(e) => handleChange(e.target.name, e.target.value)}
                                        className="
                    w-full border-none outline-none pt-3
                    text-base bg-transparent font-normal  text-black
                    min-h-32      /* ↪ minimum height */
                    resize-y      /* ↪ allow vertical resizes */
                    pr-1
                    "
                                        placeholder="Enter a description"
                                    />
                                </fieldset>
                                {errors.description && (
                                    <p className="text-red-500">{errors.description}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-4 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                    <fieldset className="border rounded px-3 py-2 border-black">
                                        <legend className="px-2 text-sm text-black">
                                            Latitude (optional)
                                        </legend>
                                        <input
                                            type="number"
                                            step="any"
                                            name="latitude"
                                            value={formData.latitude ?? ""}
                                            onChange={(e) =>
                                                handleChange(
                                                    "latitude",
                                                    e.target.value === "" ? "" : Number(e.target.value)
                                                )
                                            }
                                            placeholder="e.g. 25.19738142"
                                            className="w-full border-none outline-none text-base bg-transparent"
                                        />
                                    </fieldset>

                                    <fieldset className="border rounded px-3 py-2 border-black">
                                        <legend className="px-2 text-sm text-black">
                                            Longitude (optional)
                                        </legend>
                                        <input
                                            type="number"
                                            step="any"
                                            name="longitude"
                                            value={formData.longitude ?? ""}
                                            onChange={(e) =>
                                                handleChange(
                                                    "longitude",
                                                    e.target.value === "" ? "" : Number(e.target.value)
                                                )
                                            }
                                            placeholder="e.g. 55.27419400"
                                            className="w-full border-none outline-none text-base bg-transparent"
                                        />
                                    </fieldset>
                                </div>

                                <MapCoordinateSelector
                                    selectedCoords={selectedCoords}
                                    setSelectedCoords={setSelectedCoords}
                                    zoom={15}
                                    loading={submitLoading}
                                />
                            </div>

                            {formData.latitude != null && formData.longitude != null && (
                                <fieldset className="">
                                    <legend className="px-2 text-sm text-black">
                                        Location Preview
                                    </legend>
                                    <MapPreview
                                        latitude={formData.latitude}
                                        longitude={formData.longitude}
                                    />
                                </fieldset>
                            )}

                            {/* ─── Financial Breakdown ─────────────────────────────────────── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/** Transaction Card */}
                                <div className="p-6 bg-blue-50 rounded-lg">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-semibold">Property Features</h3>
                                            <TooltipProvider>
                                                <Tooltip delayDuration={100}>
                                                    <TooltipTrigger asChild>
                                                        <Info className="w-5 h-5 text-grey-5 cursor-pointer" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Add custom transaction details as key-value pairs.{" "}
                                                        <br />
                                                        Example: <strong>Sourcing Fee → 500</strong>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={!canAddTransaction}
                                            onClick={() => {
                                                addField(setTransactionBreakdown);
                                                // focus next key after row is added:
                                                setTimeout(() => {
                                                    const idx = transactionBreakdown.length;
                                                    txKeyRefs.current[idx]?.focus();
                                                }, 0);
                                            }}
                                            className={`rounded-full p-1 ${!canAddTransaction
                                                ? "opacity-50 bg-gray-300 cursor-not-allowed"
                                                : "bg-green-600 text-white"
                                                }`}
                                        >
                                            <FiPlus className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {transactionBreakdown.map((f, i) => (
                                        <div key={i} className="flex gap-2 mb-2">
                                            <input
                                                ref={(el) => {
                                                    txKeyRefs.current[i] = el;
                                                }}
                                                type="text"
                                                placeholder="Key"
                                                value={f.key}
                                                onChange={(e) =>
                                                    updateTransactionField(i, "key", e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        txValRefs.current[i]?.focus();
                                                    }
                                                }}
                                                className="flex-1 border rounded px-2 py-1"
                                            />
                                            <input
                                                ref={(el) => {
                                                    txValRefs.current[i] = el;
                                                }}
                                                type="number"
                                                placeholder="Value"
                                                value={f.value}
                                                onChange={(e) =>
                                                    updateTransactionField(i, "value", e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        const isLast =
                                                            i === transactionBreakdown.length - 1;
                                                        if (isLast && canAddTransaction) {
                                                            addField(setTransactionBreakdown);
                                                            setTimeout(() => {
                                                                txKeyRefs.current[i + 1]?.focus();
                                                            }, 0);
                                                        } else {
                                                            txKeyRefs.current[i + 1]?.focus();
                                                        }
                                                    }
                                                }}
                                                className="flex-1 border rounded px-2 py-1"
                                            />
                                            {transactionBreakdown.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeField(i, setTransactionBreakdown)
                                                    }
                                                >
                                                    <FiMinus className="w-5 h-5 text-red-600" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/** Rental Card */}
                                <div className="p-6 bg-blue-50 rounded-lg">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-semibold">Management Fees</h3>
                                            <TooltipProvider>
                                                <Tooltip delayDuration={100}>
                                                    <TooltipTrigger asChild>
                                                        <Info className="w-5 h-5 text-grey-5 cursor-pointer" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Add custom rental details as key-value pairs. <br />
                                                        Example: <strong>Annual Growth → 285%</strong>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={!canAddRental}
                                            onClick={() => {
                                                addField(setRentalBreakdown);
                                                setTimeout(() => {
                                                    const idx = rentalBreakdown.length;
                                                    rentKeyRefs.current[idx]?.focus();
                                                }, 0);
                                            }}
                                            className={`rounded-full p-1 ${!canAddRental
                                                ? "opacity-50 bg-gray-300 cursor-not-allowed"
                                                : "bg-green-600 text-white"
                                                }`}
                                        >
                                            <FiPlus className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {rentalBreakdown.map((f, i) => (
                                        <div key={i} className="flex gap-2 mb-2">
                                            <input
                                                ref={(el) => {
                                                    rentKeyRefs.current[i] = el;
                                                }}
                                                type="text"
                                                placeholder="Key"
                                                value={f.key}
                                                onChange={(e) =>
                                                    updateRentalField(i, "key", e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        rentValRefs.current[i]?.focus();
                                                    }
                                                }}
                                                className="flex-1 border rounded px-2 py-1"
                                            />
                                            <input
                                                ref={(el) => {
                                                    rentValRefs.current[i] = el;
                                                }}
                                                type="text"
                                                placeholder="Value or Notes"
                                                value={String(f.value)}
                                                onChange={(e) =>
                                                    updateRentalField(i, "value", e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        const isLast = i === rentalBreakdown.length - 1;
                                                        if (isLast && canAddRental) {
                                                            addField(setRentalBreakdown);
                                                            setTimeout(() => {
                                                                rentKeyRefs.current[i + 1]?.focus();
                                                            }, 0);
                                                        } else {
                                                            rentKeyRefs.current[i + 1]?.focus();
                                                        }
                                                    }
                                                }}
                                                className="flex-1 border rounded px-2 py-1"
                                            />
                                            {rentalBreakdown.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeField(i, setRentalBreakdown)}
                                                >
                                                    <FiMinus className="w-5 h-5 text-red-600" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* ──────────────────────────────────────────────────────────────── */}

                            <div className="flex w-full justify-center">
                                <Button
                                    loading={submitLoading || changeUriLoading}
                                    type="submit"
                                    className="max-w-[300px] w-full mx-auto"
                                >
                                    {submitLoading ? "Submitting" : "Submit"}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </UserDashboard>
    );
};

export default EditRequestNewProperty;
