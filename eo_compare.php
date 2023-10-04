<?php

use PrestaShop\PrestaShop\Core\Module\WidgetInterface;

class eo_compare extends Module implements WidgetInterface
{
    private $template;

    public function __construct()
    {
        $this->name = 'eo_compare';
        $this->tab = 'administration';
        $this->version = '1.0';
        $this->displayName = 'Страница сравнения товаров';
        $this->author = 'Express Office';
        $this->description = 'Страница сравнения товаров';
        $this->template = 'module:eo_compare/views/templates/hook/compare-page.tpl';

        parent::__construct();
    }

    public function install()
    {
        if (
            !parent::install()
            || !$this->registerHook('header')
        ) {
            return false;
        }

        return true;
    }

    public function uninstall()
    {
        if (
            !parent::uninstall()
            || !$this->unregisterHook('header')
        ) {
            return false;
        }

        return true;
    }

    public function renderWidget($hookName, array $configuration)
    {
        $variables = $this->getWidgetVariables($hookName, $configuration);

        $this->smarty->assign($variables);

        return $this->fetch($this->template);
    }

    public function getWidgetVariables($hookName, array $configuration)
    {
        $jsInclusion = $this->getBuilderAssets('modules/eo_compare/views/js/dist/', 'file', 'index.html');
        $cssInclusion = $this->getBuilderAssets('modules/eo_compare/views/js/dist/', 'file', 'index.css');

        $variables = [
            'jsPath'  => $jsInclusion,
            'cssPath' => $cssInclusion,
        ];

        return $variables;
    }

    public static function getBuilderAssets(
        $pathToManifest,
        $assetName,
        $entryPoint
    ) {
        $builderManifest = file_get_contents(_PS_ROOT_DIR_ . '/' . $pathToManifest . 'manifest.json');
        $builderManifest = json_decode($builderManifest, true);
        $pathToAsset     = $builderManifest[$entryPoint][$assetName];

        if (is_array($pathToAsset)) {
            $pathToAsset = reset($pathToAsset);
        }

        return '/' . $pathToManifest . $pathToAsset;
    }
}
