import {
    BooleanCustomFieldConfig as GraphQLBooleanCustomFieldConfig,
    CustomField,
    DateTimeCustomFieldConfig as GraphQLDateTimeCustomFieldConfig,
    FloatCustomFieldConfig as GraphQLFloatCustomFieldConfig,
    IntCustomFieldConfig as GraphQLIntCustomFieldConfig,
    LocaleStringCustomFieldConfig as GraphQLLocaleStringCustomFieldConfig,
    LocalizedString,
    StringCustomFieldConfig as GraphQLStringCustomFieldConfig,
} from '@vendure/common/lib/generated-types';
import { CustomFieldsObject, CustomFieldType } from '@vendure/common/lib/shared-types';

// prettier-ignore
export type DefaultValueType<T extends CustomFieldType> =
    T extends 'string' | 'localeString' ? string :
        T extends 'int' | 'float' ? number :
            T extends 'boolean' ? boolean :
                T extends 'datetime' ? Date : never;

/**
 * @description
 * Configures a custom field on an entity in the {@link CustomFields} config object.
 *
 * @docsCategory custom-fields
 */
export type TypedCustomFieldConfig<T extends CustomFieldType, C extends CustomField> = Omit<
    C,
    '__typename'
> & {
    type: T;
    /**
     * Whether or not the custom field is available via the Shop API.
     * @default true
     */
    public?: boolean;
    defaultValue?: DefaultValueType<T>;
    nullable?: boolean;
    validate?: (value: DefaultValueType<T>) => string | LocalizedString[] | void;
};
export type StringCustomFieldConfig = TypedCustomFieldConfig<'string', GraphQLStringCustomFieldConfig>;
export type LocaleStringCustomFieldConfig = TypedCustomFieldConfig<
    'localeString',
    GraphQLLocaleStringCustomFieldConfig
>;
export type IntCustomFieldConfig = TypedCustomFieldConfig<'int', GraphQLIntCustomFieldConfig>;
export type FloatCustomFieldConfig = TypedCustomFieldConfig<'float', GraphQLFloatCustomFieldConfig>;
export type BooleanCustomFieldConfig = TypedCustomFieldConfig<'boolean', GraphQLBooleanCustomFieldConfig>;
export type DateTimeCustomFieldConfig = TypedCustomFieldConfig<'datetime', GraphQLDateTimeCustomFieldConfig>;

/**
 * @description
 * An object used to configure a custom field.
 * @docsCategory custom-fields
 */
export type CustomFieldConfig =
    | StringCustomFieldConfig
    | LocaleStringCustomFieldConfig
    | IntCustomFieldConfig
    | FloatCustomFieldConfig
    | BooleanCustomFieldConfig
    | DateTimeCustomFieldConfig;

/**
 * @description
 * Most entities can have additional fields added to them by defining an array of {@link CustomFieldConfig}
 * objects on against the corresponding key.
 *
 * ### Configuration options
 *
 * All custom fields share some common properties:
 *
 * * `name: string`: The name of the field
 * * `type: string`: A string of type {@link CustomFieldType}
 * * `label?: LocalizedString[]`: An array of localized labels for the field.
 * * `description?: LocalizedString[]`: An array of localized descriptions for the field.
 * * `public?: boolean`: Whether or not the custom field is available via the Shop API. Defaults to `true`
 * * `defaultValue?: any`: The default value when an Entity is created with this field.
 * * `nullable?: boolean`: Whether the field is nullable in the database. If set to `false`, then a `defaultValue` should be provided.
 * * `validate?: (value: any) => string | LocalizedString[] | void`: A custom validation function.
 *
 * The `LocalizedString` type looks like this:
 * ```
 * type LocalizedString = {
 *   languageCode: LanguageCode;
 *   value: string;
 * };
 * ```
 *
 * In addition to the common properties, the following field types have some type-specific properties:
 *
 * #### `string` type
 *
 * * `pattern?: string`: A regex pattern which the field value must match
 * * `options?: { value: string; label?: LocalizedString[]; };`: An array of pre-defined options for the field.
 *
 * #### `localeString` type
 *
 * * `pattern?: string`: A regex pattern which the field value must match
 *
 * #### `int` & `float` type
 *
 * * `min?: number`: The minimum permitted value
 * * `max?: number`: The maximum permitted value
 * * `step?: number`: The step value
 *
 * #### `datetime` type
 *
 * The min, max & step properties for datetime fields are intended to be used as described in
 * [the datetime-local docs](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local#Additional_attributes)
 *
 * * `min?: string`: The earliest permitted date
 * * `max?: string`: The latest permitted date
 * * `step?: string`: The step value
 *
 * @example
 * ```TypeScript
 * bootstrap({
 *     // ...
 *     customFields: {
 *         Product: [
 *             { name: 'infoUrl', type: 'string' },
 *             { name: 'downloadable', type: 'boolean', defaultValue: false },
 *             { name: 'shortName', type: 'localeString' },
 *         ],
 *         User: [
 *             { name: 'socialLoginToken', type: 'string', public: false },
 *         ],
 *     },
 * })
 * ```
 *
 * @docsCategory custom-fields
 */
export interface CustomFields {
    Address?: CustomFieldConfig[];
    Collection?: CustomFieldConfig[];
    Customer?: CustomFieldConfig[];
    Facet?: CustomFieldConfig[];
    FacetValue?: CustomFieldConfig[];
    GlobalSettings?: CustomFieldConfig[];
    OrderLine?: CustomFieldConfig[];
    Product?: CustomFieldConfig[];
    ProductOption?: CustomFieldConfig[];
    ProductOptionGroup?: CustomFieldConfig[];
    ProductVariant?: CustomFieldConfig[];
    User?: CustomFieldConfig[];
}

/**
 * This interface should be implemented by any entity which can be extended
 * with custom fields.
 */
export interface HasCustomFields {
    customFields: CustomFieldsObject;
}
