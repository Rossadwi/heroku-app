import React from "react";
import { ColProps, SelectProps } from "antd";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import SelectInput, { SelectOption } from "../inputs/input-select";

type ControlledInputSelectProps<T extends FieldValues> = SelectProps & {
    placeholder: string;
    label: string;
    control: Control<T, any>;
    name: Path<T>;
    options: SelectOption[];
    labelCol?: ColProps;
};

function ControlledSelectInput<T extends FieldValues>({
    label,
    control,
    placeholder,
    name,
    loading,
    options,
    labelCol,
    ...rest
}: ControlledInputSelectProps<T>) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState: { error } }) => (
                <SelectInput
                    {...field}
                    {...rest}
                    label={label}
                    labelCol={labelCol}
                    options={options}
                    placeholder={placeholder}
                    error={error?.message}
                    value={field.value}
                    loading={loading}
                />
            )}
        />
    );
}

export default ControlledSelectInput;
