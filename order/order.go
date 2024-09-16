package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"time"
	"github.com/Bruno07/bbooking/order/db"
	"github.com/Bruno07/bbooking/order/queue"
	uuid "github.com/nu7hatch/gouuid"
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
	BookID       string    `json:"book_id"`
	Items        []Book    `json:"items"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"created_at,string"`
}

func main() {
	var param string
	in := make(chan []byte)
	flag.StringVar(&param, "opt", "", "Usage")
	flag.Parse()

	connection := queue.Connect()

	switch param {
	case "checkout":
		queue.Consumer("checkout_queue", connection, in)
		for payload := range in {
			fmt.Println(string(payload))
			notifyOrderCreated(createOrder(payload), connection)
		}
	case "payment":
		queue.Consumer("payment_queue", connection, in)
		var order Order
		for payload := range in {
			json.Unmarshal(payload, &order)
			saveOrder(order)
		}
	}
}

func createOrder(payload []byte) Order {
	var order Order

	json.Unmarshal(payload, &order)

	uuid, _ := uuid.NewV4()

	order.Uuid = uuid.String()
	order.Status = "Pendente"
	order.CreatedAt = time.Now()
	order.Items = getBook(order)

	saveOrder(order)

	return order
}

func saveOrder(order Order) {
	json, _ := json.Marshal(order)
	connection := db.Connect()

	err := connection.Set(order.Uuid, string(json), 0).Err()
	if err != nil {
		panic(err.Error())
	}
}

func notifyOrderCreated(order Order, ch *amqp.Channel) {
	json, _ := json.Marshal(order)
	queue.Notify(json, "order_ex", "", ch)
}

func getBook(order Order) []Book {
	var books []Book

	resp, err := http.Get("http://localhost:5000/books/" + order.BookID)
	if err != nil {
		panic(err.Error())
	}

	var book Book
	body, _ := io.ReadAll(resp.Body)
	json.Unmarshal(body, &book)

	books = append(books, book)

	return books
}
