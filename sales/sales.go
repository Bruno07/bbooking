package main

import (
	"encoding/json"
	"net/http"
	"time"
	"github.com/Bruno07/bbooking/sales/db"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
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
	r := mux.NewRouter()

	r.HandleFunc("/sales", getSales)

	// Configuração de CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)

	http.ListenAndServe(":5002", handler)
}

func getSales(w http.ResponseWriter, r *http.Request) {
	connection := db.Connect()

	keys, err := connection.Keys("*").Result()
    if err != nil {
        panic(err.Error())
    }

	var orders []Order
	for _, key := range keys {
		var order Order
		result, _ := connection.Get(key).Result()
		json.Unmarshal([]byte(result), &order)
		orders = append(orders, order)
	}

	json.NewEncoder(w).Encode(orders)
}