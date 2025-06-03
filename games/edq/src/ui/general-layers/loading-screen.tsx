import { DefaultSpinner } from "../shared/components/default-spinner";
import { Logo } from "../shared/components/logo";

export const LoadingScreen = () => {
	return (
		<div className="relative w-full h-full flex items-center justify-center">
			<img
				src="/assets/ui/boss.png"
				loading="lazy"
				className="
    absolute
    top-0
    left-1/2
    -translate-x-1/2
    -translate-y-[55%]
    w-[60vw]
    p-3
	max-w-[300px] md:max-w-[500px] lg:max-w-[700px] xl:max-w-[800px]
    h-auto
    pointer-events-none
  "
			/>

			<div className="w-[90%] max-w-[300px] md:max-w-[500px] lg:max-w-[700px] xl:max-w-[800px]">
				<Logo />

				<p className="absolute bottom-0 right-0 m-4 anta-regular uppercase flex items-center justify-center"> 
					<div className="mx-2 text-3xl">
					<DefaultSpinner/>
					</div>
					 Loading game</p>
			</div>
		</div>
	);
};
