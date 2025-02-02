import { Module } from '@nestjs/common';
import { METADATA } from '@nestjs/common/constants';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { pick } from '@vendure/common/lib/pick';
import { Type } from '@vendure/common/lib/shared-types';
import { DocumentNode } from 'graphql';

import { VendureConfig } from '../config/vendure-config';

import { PLUGIN_METADATA } from './plugin-metadata';

/**
 * @description
 * An object which allows a plugin to extend the Vendure GraphQL API.
 *
 * @docsCategory plugin
 * */
export interface APIExtensionDefinition {
    /**
     * @description
     * Extensions to the schema.
     *
     * @example
     * ```TypeScript
     * const schema = gql`extend type SearchReindexResponse {
     *     timeTaken: Int!
     *     indexedItemCount: Int!
     * }`;
     * ```
     */
    schema?: DocumentNode;
    /**
     * @description
     * An array of resolvers for the schema extensions. Should be defined as [Nestjs GraphQL resolver](https://docs.nestjs.com/graphql/resolvers-map)
     * classes, i.e. using the Nest `\@Resolver()` decorator etc.
     */
    resolvers: Array<Type<any>>;
}

/**
 * @description
 * This method is called before the app bootstraps and should be used to perform any needed modifications to the {@link VendureConfig}.
 *
 * @docsCategory plugin
 */
export type PluginConfigurationFn = (
    config: Required<VendureConfig>,
) => Required<VendureConfig> | Promise<Required<VendureConfig>>;

/**
 * @description
 * Defines the metadata of a Vendure plugin. This interface is an superset of the [Nestjs ModuleMetadata](https://docs.nestjs.com/modules)
 * (which allows the definition of `imports`, `exports`, `providers` and `controllers`), which means
 * that any Nestjs Module is a valid Vendure plugin. In addition, the VendurePluginMetadata allows the definition of
 * extra properties specific to Vendure.
 *
 * @docsCategory plugin
 */
export interface VendurePluginMetadata extends ModuleMetadata {
    /**
     * @description
     * A function which can modify the {@link VendureConfig} object before the server bootstraps.
     */
    configuration?: PluginConfigurationFn;
    /**
     * @description
     * The plugin may extend the default Vendure GraphQL shop api by providing extended
     * schema definitions and any required resolvers.
     */
    shopApiExtensions?: APIExtensionDefinition;
    /**
     * @description
     * The plugin may extend the default Vendure GraphQL admin api by providing extended
     * schema definitions and any required resolvers.
     */
    adminApiExtensions?: APIExtensionDefinition;
    /**
     * @description
     * The plugin may define [Nestjs microservice controllers](https://docs.nestjs.com/microservices/basics#request-response)
     * which are run in the Worker context.
     */
    workers?: Array<Type<any>>;
    /**
     * @description
     * The plugin may define custom [TypeORM database entities](https://typeorm.io/#/entities).
     */
    entities?: Array<Type<any>>;
}

/**
 * @description
 * The VendurePlugin decorator is a means of configuring and/or extending the functionality of the Vendure server. A Vendure plugin is
 * a [Nestjs Module](https://docs.nestjs.com/modules), with optional additional metadata defining things like extensions to the GraphQL API, custom
 * configuration or new database entities.
 *
 * As well as configuring the app, a plugin may also extend the GraphQL schema by extending existing types or adding
 * entirely new types. Database entities and resolvers can also be defined to handle the extended GraphQL types.
 *
 * @example
 * ```TypeScript
 * import { Controller, Get } from '\@nestjs/common';
 * import { Ctx, PluginCommonModule, ProductService, RequestContext, VendurePlugin } from '\@vendure/core';
 *
 * \@Controller('products')
 * export class ProductsController {
 *     constructor(private productService: ProductService) {}
 *
 *     \@Get()
 *     findAll(\@Ctx() ctx: RequestContext) {
 *         return this.productService.findAll(ctx);
 *     }
 * }
 *
 *
 * //A simple plugin which adds a REST endpoint for querying products.
 * \@VendurePlugin({
 *     imports: [PluginCommonModule],
 *     controllers: [ProductsController],
 * })
 * export class RestPlugin {}
 * ```
 *
 * @docsCategory plugin
 */
export function VendurePlugin(pluginMetadata: VendurePluginMetadata): ClassDecorator {
    // tslint:disable-next-line:ban-types
    return (target: Function) => {
        for (const metadataProperty of Object.values(PLUGIN_METADATA)) {
            const property = metadataProperty as keyof VendurePluginMetadata;
            if (pluginMetadata[property] != null) {
                Reflect.defineMetadata(property, pluginMetadata[property], target);
            }
        }
        const nestModuleMetadata = pick(pluginMetadata, Object.values(METADATA) as any);
        Module(nestModuleMetadata)(target);
    };
}

/**
 * @description
 * A plugin which implements this interface can define logic to run when the Vendure server is initialized.
 *
 * For example, this could be used to call out to an external API or to set up {@link EventBus} listeners.
 *
 * @docsCategory plugin
 */
export interface OnVendureBootstrap {
    onVendureBootstrap(): void | Promise<void>;
}

/**
 * @description
 * A plugin which implements this interface can define logic to run when the Vendure worker is initialized.
 *
 * For example, this could be used to start or connect to a server or databased used by the worker.
 *
 * @docsCategory plugin
 */
export interface OnVendureWorkerBootstrap {
    onVendureWorkerBootstrap(): void | Promise<void>;
}

/**
 * @description
 * A plugin which implements this interface can define logic to run before Vendure server is closed.
 *
 * For example, this could be used to clean up any processes started by the {@link OnVendureBootstrap} method.
 *
 * @docsCategory plugin
 */
export interface OnVendureClose {
    onVendureClose(): void | Promise<void>;
}

/**
 * @description
 * A plugin which implements this interface can define logic to run before Vendure worker is closed.
 *
 * For example, this could be used to close any open connections to external services.
 *
 * @docsCategory plugin
 */
export interface OnVendureWorkerClose {
    onVendureWorkerClose(): void | Promise<void>;
}

export type PluginLifecycleMethods = OnVendureBootstrap &
    OnVendureWorkerBootstrap &
    OnVendureClose &
    OnVendureWorkerClose;
