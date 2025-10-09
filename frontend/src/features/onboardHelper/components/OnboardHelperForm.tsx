import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { OnboardHelperFormData } from "../types/OnboardHelperForm.types";
import { onboardHelperSchema } from "../validators/schema";
import { VALID_PROFESSIONS } from "../constants/professions";
import { FRENCH_COUNTIES } from "../constants/frenchCounties";

interface OnboardHelperFormProps {
  onSubmit?: (data: OnboardHelperFormData) => void;
}

export function OnboardHelperForm({ onSubmit }: OnboardHelperFormProps = {}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardHelperFormData>({
    resolver: zodResolver(onboardHelperSchema),
  });

  const handleFormSubmit = (data: OnboardHelperFormData) => {
    if (onSubmit) {
      onSubmit(data);
    } else {
      console.log(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          aria-required="true"
          aria-invalid={errors.email ? "true" : "false"}
          {...register("email")}
        />
        {errors.email && <span role="alert">{errors.email.message}</span>}
      </div>

      <div>
        <label htmlFor="firstname">First Name</label>
        <input
          id="firstname"
          type="text"
          aria-required="true"
          aria-invalid={errors.firstname ? "true" : "false"}
          {...register("firstname")}
        />
        {errors.firstname && (
          <span role="alert">{errors.firstname.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="lastname">Last Name</label>
        <input
          id="lastname"
          type="text"
          aria-required="true"
          aria-invalid={errors.lastname ? "true" : "false"}
          {...register("lastname")}
        />
        {errors.lastname && <span role="alert">{errors.lastname.message}</span>}
      </div>

      <div>
        <label htmlFor="phoneNumber">Phone Number</label>
        <input
          id="phoneNumber"
          type="tel"
          aria-required="true"
          aria-invalid={errors.phoneNumber ? "true" : "false"}
          {...register("phoneNumber")}
        />
        {errors.phoneNumber && (
          <span role="alert">{errors.phoneNumber.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="profession">Profession</label>
        <select
          id="profession"
          aria-required="true"
          aria-invalid={errors.profession ? "true" : "false"}
          {...register("profession")}
        >
          <option value="">Select profession</option>
          {VALID_PROFESSIONS.map((profession) => (
            <option key={profession} value={profession}>
              {profession.replace("_", " ")}
            </option>
          ))}
        </select>
        {errors.profession && (
          <span role="alert">{errors.profession.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="birthdate">Birthdate</label>
        <input
          id="birthdate"
          type="date"
          aria-required="true"
          aria-invalid={errors.birthdate ? "true" : "false"}
          {...register("birthdate")}
        />
        {errors.birthdate && (
          <span role="alert">{errors.birthdate.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="frenchCounty">French County</label>
        <select
          id="frenchCounty"
          aria-required="true"
          aria-invalid={errors.frenchCounty ? "true" : "false"}
          {...register("frenchCounty")}
        >
          <option value="">Select county</option>
          <optgroup label="Metropolitan France">
            {FRENCH_COUNTIES.METROPOLITAN.map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </optgroup>
          <optgroup label="Corsica">
            {FRENCH_COUNTIES.CORSICA.map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </optgroup>
          <optgroup label="Overseas">
            {FRENCH_COUNTIES.OVERSEAS.map((county) => (
              <option key={county} value={county}>
                {county}
              </option>
            ))}
          </optgroup>
        </select>
        {errors.frenchCounty && (
          <span role="alert">{errors.frenchCounty.message}</span>
        )}
      </div>

      <button type="submit">Onboard Helper</button>
    </form>
  );
}
