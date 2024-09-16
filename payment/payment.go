package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/Bruno07/bbooking/payment/queue"
	amqp "github.com/rabbitmq/amqp091-go"
)

type ListPrice struct {
	Amount       float32 `json:"amount"`
	CurrencyCode string  `json:"currencyCode"`
}

type SaleInfo struct {
	ListPrice ListPrice `json:"listPrice"`
}

type VolumeInfo struct {
	Title               string   `json:"title"`
	Authors             []string `json:"authors"`
	Publisher           string   `json:"publisher"`
	PublishedDate       string   `json:"publishedDate"`
	Description         string   `json:"description"`
	PageCount           int16    `json:"pageCount"`
	Categories          []string `json:"categories"`
	PrintType           string   `json:"printType"`
	MaturityRating      string   `json:"maturityRating"`
	AllowAnonLogging    bool     `json:"allowAnonLogging"`
	ContentVersion      string   `json:"contentVersion"`
	Language            string   `json:"language"`
	PreviewLink         string   `json:"previewLink"`
	InfoLink            string   `json:"infoLink"`
	CanonicalVolumeLink string   `json:"canonicalVolumeLink"`
}

type Book struct {
	Kind       string     `json:"kind"`
	ID         string     `json:"id"`
	Etag       string     `json:"etag"`
	SelfLink   string     `json:"selfLink"`
	VolumeInfo VolumeInfo `json:"volumeInfo"`
	SaleInfo   SaleInfo   `json:"saleInfo"`
}

type Order struct {
	Uuid         string    `json:"uuid"`
	Name         string    `json:"name"`
	Phone        string    `json:"phone"`
	Email        string    `json:"email"`
	PostalCode   string    `json:"postal_code"`
	Number       string    `json:"number"`
	Address      string    `json:"address"`
	Neighborhood string    `json:"neighborhood"`
	Town         string    `json:"town"`
	State        string    `json:"state"`
	Items        []Book    `json:"items"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"created_at,string"`
}

func main() {
	in := make(chan []byte)

	connection := queue.Connect()
	queue.Consumer("order_queue", connection, in)

	var order Order
	for payload := range in {
		json.Unmarshal(payload, &order)

		order.Status = "Negado"
		if order.Items[0].SaleInfo.ListPrice.Amount < 100.00 {
			order.Status = "Aprovado"
		}

		notifyPaymentProcessed(order, connection)
	}
}

func notifyPaymentProcessed(order Order, ch *amqp.Channel) {
	json, _ := json.Marshal(order)
	queue.Notify(json, "payment_ex", "", ch)
	fmt.Println(string(json))
}