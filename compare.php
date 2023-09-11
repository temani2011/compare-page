<?php
/*
* 2007-2016 PrestaShop
*
* NOTICE OF LICENSE
*
* This source file is subject to the Open Software License (OSL 3.0)
* that is bundled with this package in the file LICENSE.txt.
* It is also available through the world-wide-web at this URL:
* http://opensource.org/licenses/osl-3.0.php
* If you did not receive a copy of the license and are unable to
* obtain it through the world-wide-web, please send an email
* to license@prestashop.com so we can send you a copy immediately.
*
* DISCLAIMER
*
* Do not edit or add to this file if you wish to upgrade PrestaShop to newer
* versions in the future. If you wish to customize PrestaShop for your
* needs please refer to http://www.prestashop.com for more information.
*
*  @author PrestaShop SA <contact@prestashop.com>
*  @copyright  2007-2016 PrestaShop SA
*  @license    http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
*  International Registered Trademark & Property of PrestaShop SA
*/

class express_compareCompareModuleFrontController extends ModuleFrontController
{
    public $ssl = true;
    private $currentCategoryId = 0;
    private $products = [];
    private $categories = [];
    private $featureGroups = [];

    public function setMedia()
    {
        $this->jsChunkFilename = 'compare.ts';
        parent::setMedia();
        //$this->addCSS(_THEME_CSS_DIR_.'comparator.css');
        $this->addJS($this->module->getLocalPath().'views/js/compare.js');
    }

    /**
     * Display ajax content (this function is called instead of classic display, in ajax mode)
     */
    public function displayAjax()
    {
        if (Tools::getValue('ajax') && Tools::getValue('ajax')) {
            switch (Tools::getValue('action')) {
                case 'get_page_data':
                    $this->getPageData();
                    break;
                case 'add_product':
                    $this->addProductToComparison();
                    break;
                case 'remove_product':
                    $this->removeProductFromComparison();
                    break;
                case 'remove_category':
                    $this->removeCategoryFromComparison();
            }
        }
    }

    protected function removeProductFromComparison()
    {
        $compareId = $this->context->cookie->id_compare ?? false;

        if (!$compareId) {
            $this->ajaxResponse([
                'errors' => [
                    [
                        'status' => '400',
                        'title'  => 'Отсутствует лист сравнения для пользователя.',
                    ],
                ]
            ]);
        }

        $productId = (int) Tools::getValue('id_product');
        $product = new Product($productId);

        if (!Validate::isLoadedObject($product)) {
            $this->ajaxResponse([
                'errors' => [
                    [
                        'status' => '400',
                        'title'  => 'Добавляемого товара не существует.',
                    ],
                ]
            ]);
        }

        $categortId = $product->id_category_default;
        CompareProduct::removeCompareProduct($compareId, $productId, $categortId);

        $this->ajaxResponse([
            'data' => [
                'type' => 'product',
                'id'   => $product->id,
            ]
        ]);
    }

    protected function addProductToComparison()
    {
        $compareId = $this->context->cookie->id_compare ?? false;
        $productId = (int) Tools::getValue('id_product');
        $product = new Product($productId);

        if (!Validate::isLoadedObject($product)) {
            $this->ajaxResponse([
                'errors' => [
                    [
                        'status' => '400',
                        'title'  => 'Добавляемого товара не существует.',
                    ],
                ]
            ]);
        }

        $categortId = $product->id_category_default;
        $categoryProductsCount = CompareProduct::getNumberProductsCategory($compareId, $categortId);

        if ($categoryProductsCount < Configuration::get('PS_COMPARATOR_MAX_ITEM')) {
            CompareProduct::addCompareProduct($compareId, $product->id, $categortId);
            $this->ajaxResponse([
                'data' => [
                    'type' => 'product',
                    'id'   => $product->id,
                ]
            ]);
        } else {
            $this->ajaxResponse([
                'errors' => [
                    [
                        'status' => '400',
                        'title'  => 'Превышен лимит товаров в одной категории сравнения.',
                    ],
                ],
            ]);
        }
    }

    protected function removeCategoryFromComparison()
    {
        $compareId = $this->context->cookie->id_compare ?? false;
        $categoryId = (int) Tools::getValue('id_category');

        if (!$compareId) {
            $this->ajaxResponse([
                'errors' => [
                    [
                        'status' => '400',
                        'title'  => 'Отсутствует лист сравнения для пользователя.',
                    ],
                ]
            ]);
        }

        CompareProduct::removeCompareCategory($compareId, $categoryId);

        $this->ajaxResponse([
            'data' => [
                'type' => 'category',
                'id'   => $categoryId,
            ]
        ]);
    }

    public function getBreadcrumbLinks()
  	{
        $breadcrumb = parent::getBreadcrumbLinks();

        $previous = "/";

        if (isset($_SERVER['HTTP_REFERER']) && strpos($_SERVER['HTTP_REFERER'], $_SERVER['SERVER_NAME']) !== false) {
            $previous = $_SERVER['HTTP_REFERER'];
        }

        $breadcrumb['links'][0] = [
            'title'      => 'Назад',
            'url'        => $previous,
            'forceArrow' => true,
        ];

        $breadcrumb['links'][] = [
            'title' => $this->getListingLabel(),
            'url'   => $this->getCurrentUrl(),
        ];

        return $breadcrumb;
  	}

  	public function getListingLabel()
  	{
  		return $this->trans('Compare', [], 'Modules.ExpressCompare.Catalog');
  	}


    protected function getPageData()
    {
        $data = [];

        $this->getComparedCategories();
        $this->getComparedProducts();
        $this->getComparedFeatureGroups();

        $data = array_merge($this->categories, $this->products, $this->featureGroups);

        $this->ajaxResponse(['data' => $data]);
    }

    protected function getComparedCategories()
    {
        $cookieCategoires = $this->context->cookie->id_compare;
        $categoriesIds = CompareProduct::getCompareCategory($cookieCategoires);

        if (!$categoriesIds) {
            return;
        }

        $categoryFromUrl = (int) Tools::getValue('compare_category');

        $this->currentCategoryId = $categoryFromUrl && in_array($categoryFromUrl, $categoriesIds)
            ? $categoryFromUrl : reset($categoriesIds);

        foreach ($categoriesIds as $key => $categoryId) {
            $cobj = new Category($categoryId);
            if (Validate::isLoadedObject($cobj)) {
                $this->categories[] = [
                    'type'       => 'category',
                    'id'         => $cobj->id,
                    'attributes' => [
                        'title'     => $cobj->getName(),
                        'count'     => CompareProduct::getNumberProductsCategory($cookieCategoires, $cobj->id),
                        'active'    => ($this->currentCategoryId == $cobj->id) ? true : false
                    ],
                    'links'      => [
                        'self'      => $cobj->getLink()
                    ]
                ];

                if ($this->currentCategoryId == $cobj->id) {
                    $productIds = CompareProduct::getCompareProducts(
                        $this->context->cookie->id_compare,
                        $this->currentCategoryId
                    );

                    $invoiceLink = $this->context->link->getModuleLink(
                        'eo_invoices',
                        'ComparePresentation'
                    );

                    $this->categories[$key]['links']['invoice'] = $invoiceLink;
                }
            } else {
                CompareProduct::removeCompareCategory($cookieCategoires, $this->currentCategoryId);
            }
        }
    }

    protected function getComparedProducts()
    {
        $productsIds = CompareProduct::getCompareProducts($this->context->cookie->id_compare, $this->currentCategoryId);

        if (!$productsIds) {
            return;
        }

        $wishlistProducts = rwWishlist::getWishlistProducts($this->context->cookie->id_wishlist)  ?: [];

        foreach ($productsIds as $productId) {
            $product = new Product($productId);

            $category = new Category($product->id_category_default);
            $name = $product->alt_name[1] . ' ' . Product::getCurrentAttributeName($product);
            $quantity = Product::getQuantity($product->id, null, $product->cache_is_pack);
            $proddays = DeliveryEO::getProdDays($product);
            $priceRow = ['id_product' => $product->id];
            Product::includePriceRow($priceRow, $product);

            $noPhoto = HelperPath::getNoPhoto($this->context);
            $image = Product::getCoverByProduct($product->id, $product->id_product_attribute, '400x270') ?? $noPhoto;

            $jsonApiProduct = [
                'type'          => 'product',
                'id'            => $product->id,
                'attributes'    => [
                    'title'                     => $name,
                    'width'                     => ceil($product->width),
                    'height'                    => ceil($product->height),
                    'depth'                     => ceil($product->depth),
                    'available_for_order'       => (bool) $product->available_for_order,
                    'available'                 => (bool) $product->available,
                    'show_price'                => (bool) $product->show_price,
                    'id_category'               => (int) $this->currentCategoryId,
                    'category'                  => $category->name[1],
                    'id_product_attribute'      => (int) $product->id_product_attribute,
                    'proddays'                  => $proddays,
                    'quantity'                  => $quantity,
                    'in_wishlist'               => in_array($product->id, $wishlistProducts),
                    'in_compare'                => true,
                    'cache_is_pack'             => $product->cache_is_pack,
                    'has_discount'              => $priceRow['has_discount'],
                    'price'                     => $priceRow['price'],
                    'price_raw'                 => $priceRow['price_raw'],
                    'old_price'                 => $priceRow['old_price'],
                    'old_price_raw'             => $priceRow['old_price_raw'],
                    'discount_percentage'       => $priceRow['discount_percentage'] ?? 0,
                    'image_active_index'        => 0,
                    'comments'                  => [],
                    'badges'                    => [],
                ],
                'relationships'  => [
                    'categories' => [
                        'data'   => [
                            'id'                => $product->id_category_default,
                            'title'             => $category->name[1],
                        ]
                    ]
                ],
                'links'          => [
                    'self'                      => $product->getLink(),
                    'images'                    => [$image],
                ]
            ];

            $this->products[] = $jsonApiProduct;
        }
    }

    protected function getComparedFeatureGroups()
    {
        if (!$this->products) {
            return;
        }

        $featuresToGroups = [];
        foreach ($this->products as $key => $product) {
            $features = $this->getComparedFeatures($product['id']);

            if ($features) {
                foreach ($features as $feature) {
                    if (!isset($featuresToGroups[$feature['id']])) {
                        $featuresToGroups[$feature['id']] = $feature;
                    }
                    unset($feature['attributes']);
                    $this->products[$key]['relationships']['features']['data'][] = $feature;
                }
                $this->products[$key]['included'] = $features ? $features : [];
            }
        }

        foreach ($featuresToGroups as $feature) {
            $featureGroupId = (int) $feature['attributes']['id_group'];
            $featureGroupName = $feature['attributes']['group_name'];

            if (!isset($this->featureGroups[$featureGroupId])) {
                $this->featureGroups[$featureGroupId] = [
                    'type'          => 'feature_group',
                    'id'            => $featureGroupId,
                    'attributes'    => [
                        'title'         => $featureGroupName,
                        'showed'        => true,
                    ]
                ];
            }

            $attributesDataFeatureGroup = [
                'group_name' => $featureGroupName,
                'title'      => $feature['attributes']['title'],
                'showed'     => true,
                'value'      => 0,
            ];


            if (isset($feature['attributes']['description']) && $feature['attributes']['description']) {
                $attributesDataFeatureGroup['description'] = $feature['attributes']['description'];
            }

            $this->featureGroups[$featureGroupId]['attributes']['features'][] = [
                'type'          => 'feature',
                'id'            => $feature['id'],
                'attributes'    => $attributesDataFeatureGroup,
            ];
        }

        sort($this->featureGroups);
    }

    protected function getComparedFeatures(int $productId)
    {
        $comments = Product::getProductCommentsCount($productId);
        $rating = Product::getProductCommentsRating($productId);
        $comments = Product::getProductCommentsCount($productId);

        $ratingFeature = [
            'id_feature'         => '-1',
            'id_feature_group'   => '-1',
            'feature_group_name' => 'Рейтинг',
            'value'              => $rating,
            'comments'           => $comments,
        ];

        $features = Product::getFeaturesStatic($productId);
        $features = array_merge([$ratingFeature], $features);

        if (!$features) {
            return [];
        }

        $jsonApiFeatures = [];

        foreach ($features as $key => $feature) {
            $jsonApiFeatures[$key] = [
                'type'          => 'feature',
                'id'            => (int) $feature['id_feature'],
                'attributes'    => [
                    'id_group'   => $feature['id_feature_group'] ?? 0,
                    'group_name' => $feature['feature_group_name'] ? $feature['feature_group_name'] : 'Общее',
                    'title'      => $feature['name'] ?? '',
                    'value'      => $feature['value'],
                ],
            ];

            if (isset($feature['description']) && $feature['description'] && trim($feature['description'])) {
                $jsonApiFeatures[$key]['attributes']['description'] = $feature['description'];
            }

            if (isset($feature['comments'])) {
                $jsonApiFeatures[$key]['attributes']['comments'] = $feature['comments'];
            }
        }

        return $jsonApiFeatures;
    }

    protected function ajaxResponse($data)
    {
        header('Content-Type: application/json');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
}
